package com.finfinance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResponse {
    private Integer month;
    private Integer year;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal net;
    private long transactionCount;
    private List<DashboardCategoryResponse> expensesByCategory;
}
