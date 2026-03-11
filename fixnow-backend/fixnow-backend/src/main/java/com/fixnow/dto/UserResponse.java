package com.fixnow.dto;

import com.fixnow.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserResponse {
	private Long id;
	private String name;
	private String email;
	private Role role;
}

