package com.fixnow.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

	private final SecretKey key;
	private final long expirationMs;

	public JwtUtil(
			@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.expirationMs = expirationMs;
	}

	public String generateToken(String subjectEmail, String role) {
		Date now = new Date();
		Date exp = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
				.subject(subjectEmail)
				.claim("role", role)
				.issuedAt(now)
				.expiration(exp)
				.signWith(key)
				.compact();
	}

	public boolean isTokenValid(String token) {
		try {
			parseAllClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public String extractEmail(String token) {
		return parseAllClaims(token).getSubject();
	}

	public String extractRole(String token) {
		Object role = parseAllClaims(token).get("role");
		return role == null ? null : role.toString();
	}

	private Claims parseAllClaims(String token) {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}
}

