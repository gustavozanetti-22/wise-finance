package com.finfinance.repository;

import com.finfinance.entity.Budget;
import com.finfinance.entity.Category;
import com.finfinance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserOrderByYearDescMonthDesc(User user);

    List<Budget> findByUserAndMonthAndYearOrderByCategoryNameAsc(
            User user, Integer month, Integer year);

    Optional<Budget> findByIdAndUser(Long id, User user);

    Optional<Budget> findByUserAndCategoryAndMonthAndYear(
            User user, Category category, Integer month, Integer year);
}
