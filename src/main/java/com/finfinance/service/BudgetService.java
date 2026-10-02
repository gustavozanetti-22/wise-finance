package com.finfinance.service;

import com.finfinance.dto.BudgetRequest;
import com.finfinance.dto.BudgetResponse;
import com.finfinance.entity.Budget;
import com.finfinance.entity.Category;
import com.finfinance.entity.Transaction;
import com.finfinance.entity.User;
import com.finfinance.enums.TransactionType;
import com.finfinance.exception.ResourceNotFoundException;
import com.finfinance.repository.BudgetRepository;
import com.finfinance.repository.CategoryRepository;
import com.finfinance.repository.TransactionRepository;
import com.finfinance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         UserRepository userRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, String userEmail) {
        User user = getUser(userEmail);
        Category category = getCategory(request.getCategoryId());

        if (budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, category, request.getMonth(), request.getYear()).isPresent()) {
            throw new IllegalArgumentException(
                    "A budget already exists for this category and period.");
        }

        Budget budget = new Budget();
        applyRequest(budget, request, user, category);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(String userEmail, Integer month, Integer year) {
        User user = getUser(userEmail);
        List<Budget> budgets;
        if (month == null && year == null) {
            budgets = budgetRepository.findByUserOrderByYearDescMonthDesc(user);
        } else {
            validatePeriod(month, year);
            budgets = budgetRepository.findByUserAndMonthAndYearOrderByCategoryNameAsc(
                    user, month, year);
        }
        return budgets.stream().map(this::toResponse).toList();
    }

    @Transactional
    public BudgetResponse updateBudget(Long id, BudgetRequest request, String userEmail) {
        User user = getUser(userEmail);
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found."));
        Category category = getCategory(request.getCategoryId());

        budgetRepository.findByUserAndCategoryAndMonthAndYear(
                        user, category, request.getMonth(), request.getYear())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "A budget already exists for this category and period.");
                });

        applyRequest(budget, request, user, category);
        return toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id, String userEmail) {
        User user = getUser(userEmail);
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found."));
        budgetRepository.delete(budget);
    }

    private void applyRequest(Budget budget, BudgetRequest request,
                              User user, Category category) {
        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setCategory(category);
        budget.setUser(user);
    }

    private BudgetResponse toResponse(Budget budget) {
        YearMonth period = YearMonth.of(budget.getYear(), budget.getMonth());
        List<Transaction> transactions = transactionRepository
                .findByUserAndCategoryAndTransactionDateBetween(
                        budget.getUser(), budget.getCategory(),
                        period.atDay(1), period.atEndOfMonth());

        BigDecimal spent = transactions.stream()
                .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remaining = budget.getAmount().subtract(spent);
        BigDecimal percentage = budget.getAmount().signum() == 0
                ? BigDecimal.ZERO
                : spent.multiply(BigDecimal.valueOf(100))
                .divide(budget.getAmount(), 2, RoundingMode.HALF_UP);

        return new BudgetResponse(
                budget.getId(), budget.getCategory().getId(), budget.getCategory().getName(),
                budget.getAmount(), budget.getMonth(), budget.getYear(),
                spent, remaining, percentage);
    }

    private Category getCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void validatePeriod(Integer month, Integer year) {
        if (month == null || year == null) {
            throw new IllegalArgumentException("Month and year must be provided together.");
        }
        YearMonth.of(year, month);
    }
}
