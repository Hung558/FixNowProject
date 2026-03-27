package com.fixnow.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fixnow.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	Optional<Review> findByBookingId(Long bookingId);

	@Query("SELECT AVG(r.rating) FROM Review r WHERE r.booking.technician.email = :email")
	Double getAverageRatingByTechnicianEmail(@Param("email") String email);
}

