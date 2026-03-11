package com.fixnow.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixnow.dto.BookingCreateRequest;
import com.fixnow.dto.BookingResponse;
import com.fixnow.dto.BookingStatusUpdateRequest;
import com.fixnow.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@Validated
@RequiredArgsConstructor
public class BookingController {

	private final BookingService bookingService;

	@PostMapping
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<BookingResponse> create(
			@AuthenticationPrincipal UserDetails user,
			@Valid @RequestBody BookingCreateRequest req) {
		return ResponseEntity.ok(bookingService.createBooking(user.getUsername(), req));
	}

	@PutMapping("/{id}/accept")
	@PreAuthorize("hasRole('TECHNICIAN')")
	public ResponseEntity<BookingResponse> accept(
			@AuthenticationPrincipal UserDetails user,
			@PathVariable("id") Long id) {
		return ResponseEntity.ok(bookingService.acceptBooking(user.getUsername(), id));
	}

	@PutMapping("/{id}/status")
	@PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
	public ResponseEntity<BookingResponse> updateStatus(
			@AuthenticationPrincipal UserDetails user,
			@PathVariable("id") Long id,
			@Valid @RequestBody BookingStatusUpdateRequest req) {
		return ResponseEntity.ok(bookingService.updateStatus(user.getUsername(), id, req.getStatus()));
	}

	@GetMapping("/me")
	public ResponseEntity<List<BookingResponse>> myBookings(@AuthenticationPrincipal UserDetails user) {
		return ResponseEntity.ok(bookingService.listMyBookings(user.getUsername()));
	}
}

