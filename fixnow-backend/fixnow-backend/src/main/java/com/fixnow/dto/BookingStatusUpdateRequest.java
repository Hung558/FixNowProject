package com.fixnow.dto;

import com.fixnow.entity.BookingStatus;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusUpdateRequest {
	@NotNull
	private BookingStatus status;
}

