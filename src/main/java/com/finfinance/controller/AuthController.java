package com.finfinance.controller;

import com.finfinance.dto.LoginRequest;
import com.finfinance.dto.LoginResponse;
import com.finfinance.dto.RegisterRequest;
import com.finfinance.entity.User;
import com.finfinance.service.AuthService;
import com.finfinance.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    public AuthController(
            UserService userService,
            AuthService authService) {

        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.registerEntity(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.createLoginResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}