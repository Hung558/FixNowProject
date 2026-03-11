package com.fixnow.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ServiceResponse {
	private Long id;
	private String name;
	private String description;
	private BigDecimal price;
}

