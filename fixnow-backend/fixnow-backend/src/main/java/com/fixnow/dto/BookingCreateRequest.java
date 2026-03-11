package com.fixnow.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingCreateRequest {
	@NotNull
	private Long serviceId;

	private String description;

	private String imageUrl;
}

