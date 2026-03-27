package com.fixnow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixnow.dto.TechStatsResponse;
import com.fixnow.dto.UserResponse;
import com.fixnow.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/me/stats")
	@PreAuthorize("hasRole('TECHNICIAN')")
	public ResponseEntity<TechStatsResponse> getMyStats(@AuthenticationPrincipal UserDetails user) {
		return ResponseEntity.ok(userService.getTechStats(user.getUsername()));
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<UserResponse>> listAll() {
		return ResponseEntity.ok(userService.listAllUsers());
	}
}

