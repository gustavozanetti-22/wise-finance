package com.finfinance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class AccountResponse {

    private Long id;
    private String name;
    private BigDecimal balance;
}