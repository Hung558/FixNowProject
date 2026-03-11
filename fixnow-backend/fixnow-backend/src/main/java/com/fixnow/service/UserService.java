package com.fixnow.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fixnow.dto.AuthResponse;
import com.fixnow.dto.LoginRequest;
import com.fixnow.dto.RegisterRequest;
import com.fixnow.dto.UserResponse;
import com.fixnow.entity.Role;
import com.fixnow.entity.User;
import com.fixnow.repository.UserRepository;
import com.fixnow.security.JwtUtil;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;

	public AuthResponse register(RegisterRequest req) {
		if (userRepository.existsByEmail(req.getEmail())) {
			throw new ResponseStatusException(BAD_REQUEST, "Email already exists");
		}
		Role role = req.getRole() == null ? Role.CUSTOMER : req.getRole();
		User user = User.builder()
				.name(req.getName())
				.email(req.getEmail().toLowerCase())
				.password(passwordEncoder.encode(req.getPassword()))
				.role(role)
				.build();
		user = userRepository.save(user);
		String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
		return AuthResponse.builder()
				.token(token)
				.userId(user.getId())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRole())
				.build();
	}

	public AuthResponse login(LoginRequest req) {
		Authentication auth = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(req.getEmail().toLowerCase(), req.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(auth);

		User user = userRepository.findByEmail(req.getEmail().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
		String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
		return AuthResponse.builder()
				.token(token)
				.userId(user.getId())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRole())
				.build();
	}

	public User getByEmailOrThrow(String email) {
		return userRepository.findByEmail(email.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
	}

	public List<UserResponse> listAllUsers() {
		return userRepository.findAll().stream().map(this::toResponse).toList();
	}

	public UserResponse toResponse(User u) {
		return UserResponse.builder()
				.id(u.getId())
				.name(u.getName())
				.email(u.getEmail())
				.role(u.getRole())
				.build();
	}
}

