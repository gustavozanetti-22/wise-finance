package com.finfinance.repository;

import com.finfinance.entity.Transaction;
import com.finfinance.entity.Category;
import com.finfinance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUser(Long id, User user);

    List<Transaction> findByUserAndTransactionDateBetween(
            User user, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserAndCategoryAndTransactionDateBetween(
            User user, Category category, LocalDate startDate, LocalDate endDate);

    boolean existsByAccountId(Long accountId);
}
