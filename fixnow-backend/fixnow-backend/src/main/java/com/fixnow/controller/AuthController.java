package com.fixnow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixnow.dto.AuthResponse;
import com.fixnow.dto.LoginRequest;
import com.fixnow.dto.RegisterRequest;
import com.fixnow.dto.UserResponse;
import com.fixnow.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final UserService userService;

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
		return ResponseEntity.ok(userService.register(req));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
		return ResponseEntity.ok(userService.login(req));
	}

	@GetMapping("/me")
	public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails user) {
		if (user == null) {
			return ResponseEntity.status(401).build();
		}
		return ResponseEntity.ok(userService.toResponse(userService.getByEmailOrThrow(user.getUsername())));
	}
}
