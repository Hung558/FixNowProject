package com.fixnow.dto;

import com.fixnow.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
	private String token;
	private Long userId;
	private String name;
	private String email;
	private Role role;
}

