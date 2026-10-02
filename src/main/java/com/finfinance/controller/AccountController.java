package com.finfinance.controller;

import com.finfinance.dto.AccountRequest;
import com.finfinance.dto.AccountResponse;
import com.finfinance.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(
            AccountService accountService) {

        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountRequest request,
            Authentication authentication) {

        AccountResponse account =
                accountService.createAccount(
                        request,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(account);
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(
            Authentication authentication) {

        return ResponseEntity.ok(
                accountService.getAccounts(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(accountService.updateAccount(
                id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(
            @PathVariable Long id,
            Authentication authentication) {
        accountService.deleteAccount(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
