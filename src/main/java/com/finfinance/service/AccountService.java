package com.finfinance.service;

import com.finfinance.dto.AccountRequest;
import com.finfinance.dto.AccountResponse;
import com.finfinance.entity.Account;
import com.finfinance.entity.User;
import com.finfinance.repository.AccountRepository;
import com.finfinance.repository.TransactionRepository;
import com.finfinance.repository.UserRepository;
import com.finfinance.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(
            AccountRepository accountRepository,
            UserRepository userRepository,
            TransactionRepository transactionRepository) {

        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public AccountResponse createAccount(
            AccountRequest request,
            String userEmail) {

        User user = getUser(userEmail);

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

        User user = getUser(userEmail);

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

    @Transactional
    public AccountResponse updateAccount(Long id, AccountRequest request,
                                         String userEmail) {
        Account account = getAccount(id, userEmail);
        account.setName(request.getName());
        return toResponse(accountRepository.save(account));
    }

    @Transactional
    public void deleteAccount(Long id, String userEmail) {
        Account account = getAccount(id, userEmail);
        if (transactionRepository.existsByAccountId(id)) {
            throw new IllegalArgumentException(
                    "Account cannot be deleted while it has transactions.");
        }
        accountRepository.delete(account);
    }

    private Account getAccount(Long id, String userEmail) {
        User user = getUser(userEmail);
        return accountRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found."));
    }

    private User getUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(account.getId(), account.getName(), account.getBalance());
    }
}
