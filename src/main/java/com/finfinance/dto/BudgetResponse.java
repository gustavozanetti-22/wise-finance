package com.finfinance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private Integer month;
    private Integer year;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal percentageUsed;
}
