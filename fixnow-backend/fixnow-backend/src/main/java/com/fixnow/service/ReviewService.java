package com.fixnow.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fixnow.dto.ReviewCreateRequest;
import com.fixnow.dto.ReviewResponse;
import com.fixnow.entity.Booking;
import com.fixnow.entity.BookingStatus;
import com.fixnow.entity.Review;
import com.fixnow.entity.Role;
import com.fixnow.entity.User;
import com.fixnow.repository.ReviewRepository;
import com.fixnow.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class ReviewService {

	private final ReviewRepository reviewRepository;
	private final BookingService bookingService;
	private final UserRepository userRepository;

	@Transactional
	public ReviewResponse addReview(String customerEmail, ReviewCreateRequest req) {
		User customer = userRepository.findByEmail(customerEmail.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Customer not found"));
		if (customer.getRole() != Role.CUSTOMER) {
			throw new ResponseStatusException(FORBIDDEN, "Only CUSTOMER can add review");
		}

		Booking booking = bookingService.getByIdOrThrow(req.getBookingId());
		if (booking.getCustomer() == null || !booking.getCustomer().getId().equals(customer.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "This booking does not belong to you");
		}
		if (booking.getStatus() != BookingStatus.COMPLETED) {
			throw new ResponseStatusException(BAD_REQUEST, "Only COMPLETED booking can be reviewed");
		}
		if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
			throw new ResponseStatusException(BAD_REQUEST, "Booking already reviewed");
		}

		Review review = Review.builder()
				.booking(booking)
				.rating(req.getRating())
				.comment(req.getComment())
				.build();

		review = reviewRepository.save(review);
		return toResponse(review);
	}

	public ReviewResponse toResponse(Review r) {
		return ReviewResponse.builder()
				.id(r.getId())
				.bookingId(r.getBooking() == null ? null : r.getBooking().getId())
				.rating(r.getRating())
				.comment(r.getComment())
				.build();
	}
}

