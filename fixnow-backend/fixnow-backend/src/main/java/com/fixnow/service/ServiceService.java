package com.fixnow.service;

import java.util.List;

import org.springframework.web.server.ResponseStatusException;

import com.fixnow.dto.ServiceResponse;
import com.fixnow.entity.Service;
import com.fixnow.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceService {

	private final ServiceRepository serviceRepository;

	public List<ServiceResponse> list() {
		return serviceRepository.findAll().stream().map(this::toResponse).toList();
	}

	public Service getByIdOrThrow(Long id) {
		return serviceRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Service not found"));
	}

	public ServiceResponse toResponse(Service s) {
		return ServiceResponse.builder()
				.id(s.getId())
				.name(s.getName())
				.description(s.getDescription())
				.price(s.getPrice())
				.build();
	}
}

