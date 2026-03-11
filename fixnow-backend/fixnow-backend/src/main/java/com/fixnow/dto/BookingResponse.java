package com.fixnow.dto;

import java.time.Instant;

import com.fixnow.entity.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class BookingResponse {
	private Long id;
	private Long customerId;
	private Long technicianId;
	private Long serviceId;
	private String description;
	private String imageUrl;
	private BookingStatus status;
	private Instant createdAt;
}

