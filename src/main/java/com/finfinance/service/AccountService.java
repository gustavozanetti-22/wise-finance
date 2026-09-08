package com.finfinance.service;

import com.finfinance.dto.AccountRequest;
import com.finfinance.dto.AccountResponse;
import com.finfinance.entity.Account;
import com.finfinance.entity.User;
import com.finfinance.repository.AccountRepository;
import com.finfinance.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(
            AccountRepository accountRepository,
            UserRepository userRepository) {

        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public AccountResponse createAccount(
            AccountRequest request,
            String userEmail) {

        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow();

        Account account = new Account();

        account.setName(request.getName());
        account.setBalance(request.getBalance());
        account.setUser(user);

        Account savedAccount =
                accountRepository.save(account);

        return new AccountResponse(
                savedAccount.getId(),
                savedAccount.getName(),
                savedAccount.getBalance()
        );
    }

    public List<AccountResponse> getAccounts(
            String userEmail) {

        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow();

        return accountRepository
                .findByUser(user)
                .stream()
                .map(account ->
                        new AccountResponse(
                                account.getId(),
                                account.getName(),
                                account.getBalance()
                        )
                )
                .toList();
    }
}