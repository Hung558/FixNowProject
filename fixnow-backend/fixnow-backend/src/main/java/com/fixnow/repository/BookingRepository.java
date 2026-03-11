package com.fixnow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixnow.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	List<Booking> findByCustomerId(Long customerId);

	List<Booking> findByTechnicianId(Long technicianId);
}

