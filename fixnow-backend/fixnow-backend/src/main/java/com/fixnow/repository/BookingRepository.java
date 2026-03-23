package com.fixnow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixnow.entity.Booking;
import com.fixnow.entity.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	List<Booking> findByCustomerId(Long customerId);

	List<Booking> findByTechnicianId(Long technicianId);

	List<Booking> findByStatus(BookingStatus status);
	List<Booking> findByStoreId(Long storeId);
	List<Booking> findByStoreIdAndStatus(Long storeId, BookingStatus status);
}
