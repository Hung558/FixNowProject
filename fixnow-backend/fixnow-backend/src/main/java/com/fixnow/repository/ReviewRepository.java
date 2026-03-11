package com.fixnow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixnow.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	Optional<Review> findByBookingId(Long bookingId);
}

