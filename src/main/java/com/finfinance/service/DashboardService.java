package com.finfinance.service;

import com.finfinance.dto.DashboardCategoryResponse;
import com.finfinance.dto.DashboardResponse;
import com.finfinance.entity.Account;
import com.finfinance.entity.Transaction;
import com.finfinance.entity.User;
import com.finfinance.enums.TransactionType;
import com.finfinance.exception.ResourceNotFoundException;
import com.finfinance.repository.AccountRepository;
import com.finfinance.repository.TransactionRepository;
import com.finfinance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public DashboardService(UserRepository userRepository,
                            AccountRepository accountRepository,
                            TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String userEmail, Integer month, Integer year) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        YearMonth period = resolvePeriod(month, year);
        LocalDate start = period.atDay(1);
        LocalDate end = period.atEndOfMonth();
        List<Transaction> transactions = transactionRepository
                .findByUserAndTransactionDateBetween(user, start, end);

        BigDecimal income = sumByType(transactions, TransactionType.INCOME);
        BigDecimal expense = sumByType(transactions, TransactionType.EXPENSE);
        BigDecimal balance = accountRepository.findByUser(user).stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, CategoryTotal> categoryTotals = new LinkedHashMap<>();
        transactions.stream()
                .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                .forEach(transaction -> categoryTotals.compute(
                        transaction.getCategory().getId(),
                        (id, current) -> current == null
                                ? new CategoryTotal(transaction.getCategory().getName(), transaction.getAmount())
                                : current.add(transaction.getAmount())));

        List<DashboardCategoryResponse> categories = categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<Long, CategoryTotal>comparingByValue(
                        Comparator.comparing(CategoryTotal::amount)).reversed())
                .map(entry -> new DashboardCategoryResponse(
                        entry.getKey(), entry.getValue().name(), entry.getValue().amount(),
                        percentage(entry.getValue().amount(), expense)))
                .toList();

        return new DashboardResponse(
                period.getMonthValue(), period.getYear(), start, end,
                balance, income, expense, income.subtract(expense),
                transactions.size(), categories);
    }

    private BigDecimal sumByType(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(transaction -> transaction.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal percentage(BigDecimal amount, BigDecimal total) {
        if (total.signum() == 0) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(BigDecimal.valueOf(100))
                .divide(total, 2, RoundingMode.HALF_UP);
    }

    private YearMonth resolvePeriod(Integer month, Integer year) {
        if (month == null && year == null) {
            return YearMonth.now();
        }
        if (month == null || year == null) {
            throw new IllegalArgumentException("Month and year must be provided together.");
        }
        return YearMonth.of(year, month);
    }

    private record CategoryTotal(String name, BigDecimal amount) {
        private CategoryTotal add(BigDecimal value) {
            return new CategoryTotal(name, amount.add(value));
        }
    }
}
