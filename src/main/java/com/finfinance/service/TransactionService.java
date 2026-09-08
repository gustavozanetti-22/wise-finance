package com.finfinance.service;

import com.finfinance.dto.TransactionRequest;
import com.finfinance.dto.TransactionResponse;
import com.finfinance.entity.Account;
import com.finfinance.entity.Category;
import com.finfinance.entity.Transaction;
import com.finfinance.entity.User;
import com.finfinance.enums.TransactionType;
import com.finfinance.exception.ResourceNotFoundException;
import com.finfinance.repository.AccountRepository;
import com.finfinance.repository.CategoryRepository;
import com.finfinance.repository.TransactionRepository;
import com.finfinance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            AccountRepository accountRepository,
            CategoryRepository categoryRepository) {

        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public TransactionResponse createTransaction(
            TransactionRequest request,
            String userEmail) {

        User user = getUser(userEmail);

        Account account = accountRepository
                .findByIdAndUser(request.getAccountId(), user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Account not found."
                        )
                );

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found."
                        )
                );

        Transaction transaction = new Transaction();

        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setCategory(category);
        transaction.setAccount(account);
        transaction.setUser(user);

        applyTransactionToBalance(transaction);

        accountRepository.save(account);

        return toResponse(
                transactionRepository.save(transaction)
        );
    }

    public List<TransactionResponse> getTransactions(
            String userEmail,
            TransactionType type,
            Long categoryId,
            Long accountId,
            Integer month,
            Integer year) {

        User user = getUser(userEmail);

        Specification<Transaction> specification =
                (root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(
                                root.get("user"),
                                user
                        );

        if (type != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("type"),
                                    type
                            )
            );
        }

        if (categoryId != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("category").get("id"),
                                    categoryId
                            )
            );
        }

        if (accountId != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.equal(
                                    root.get("account").get("id"),
                                    accountId
                            )
            );
        }

        if (month != null || year != null) {

            if (month == null || year == null) {
                throw new IllegalArgumentException(
                        "Month and year must be provided together."
                );
            }

            YearMonth yearMonth = YearMonth.of(year, month);

            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();

            specification = specification.and(
                    (root, query, criteriaBuilder) ->
                            criteriaBuilder.between(
                                    root.<LocalDate>get("transactionDate"),
                                    startDate,
                                    endDate
                            )
            );
        }

        Sort sort = Sort.by(
                Sort.Order.desc("transactionDate"),
                Sort.Order.desc("id")
        );

        return transactionRepository
                .findAll(specification, sort)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TransactionResponse updateTransaction(
            Long id,
            TransactionRequest request,
            String userEmail) {

        User user = getUser(userEmail);

        Transaction transaction = transactionRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transaction not found."
                        )
                );

        /*
         * Primeiro desfazemos o efeito da transação antiga
         * sobre o saldo.
         */
        reverseTransactionFromBalance(transaction);

        Account oldAccount = transaction.getAccount();
        accountRepository.save(oldAccount);

        Account newAccount = accountRepository
                .findByIdAndUser(request.getAccountId(), user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Account not found."
                        )
                );

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found."
                        )
                );

        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setCategory(category);
        transaction.setAccount(newAccount);

        /*
         * Agora aplicamos os novos valores ao saldo.
         */
        applyTransactionToBalance(transaction);

        accountRepository.save(newAccount);

        return toResponse(
                transactionRepository.save(transaction)
        );
    }

    @Transactional
    public void deleteTransaction(
            Long id,
            String userEmail) {

        User user = getUser(userEmail);

        Transaction transaction = transactionRepository
                .findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Transaction not found."
                        )
                );

        reverseTransactionFromBalance(transaction);

        accountRepository.save(transaction.getAccount());

        transactionRepository.delete(transaction);
    }

    private void applyTransactionToBalance(
            Transaction transaction) {

        Account account = transaction.getAccount();

        if (transaction.getType() == TransactionType.INCOME) {

            account.setBalance(
                    account.getBalance()
                            .add(transaction.getAmount())
            );

        } else {

            account.setBalance(
                    account.getBalance()
                            .subtract(transaction.getAmount())
            );
        }
    }

    private void reverseTransactionFromBalance(
            Transaction transaction) {

        Account account = transaction.getAccount();

        if (transaction.getType() == TransactionType.INCOME) {

            account.setBalance(
                    account.getBalance()
                            .subtract(transaction.getAmount())
            );

        } else {

            account.setBalance(
                    account.getBalance()
                            .add(transaction.getAmount())
            );
        }
    }

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found."
                        )
                );
    }

    private TransactionResponse toResponse(
            Transaction transaction) {

        return new TransactionResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getTransactionDate(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getAccount().getId(),
                transaction.getAccount().getName()
        );
    }
}