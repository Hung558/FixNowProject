package com.fixnow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ReviewResponse {
	private Long id;
	private Long bookingId;
	private Integer rating;
	private String comment;
}

