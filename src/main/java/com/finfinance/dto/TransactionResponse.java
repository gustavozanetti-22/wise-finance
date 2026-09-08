package com.finfinance.dto;

import com.finfinance.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private String description;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate transactionDate;

    private Long categoryId;
    private String categoryName;

    private Long accountId;
    private String accountName;
}