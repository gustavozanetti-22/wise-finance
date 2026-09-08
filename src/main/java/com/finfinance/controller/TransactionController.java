package com.finfinance.controller;

import com.finfinance.dto.TransactionRequest;
import com.finfinance.dto.TransactionResponse;
import com.finfinance.enums.TransactionType;
import com.finfinance.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService) {

        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        transactionService.createTransaction(
                                request,
                                authentication.getName()
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @RequestParam(required = false)
            TransactionType type,

            @RequestParam(required = false)
            Long categoryId,

            @RequestParam(required = false)
            Long accountId,

            @RequestParam(required = false)
            Integer month,

            @RequestParam(required = false)
            Integer year,

            Authentication authentication) {

        return ResponseEntity.ok(
                transactionService.getTransactions(
                        authentication.getName(),
                        type,
                        categoryId,
                        accountId,
                        month,
                        year
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                transactionService.updateTransaction(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            Authentication authentication) {

        transactionService.deleteTransaction(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}