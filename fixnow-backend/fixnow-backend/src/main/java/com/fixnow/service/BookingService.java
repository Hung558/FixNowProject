package com.fixnow.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fixnow.dto.BookingCreateRequest;
import com.fixnow.dto.BookingResponse;
import com.fixnow.entity.Booking;
import com.fixnow.entity.BookingStatus;
import com.fixnow.entity.Role;
import com.fixnow.entity.User;
import com.fixnow.repository.BookingRepository;
import com.fixnow.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class BookingService {

	private final BookingRepository bookingRepository;
	private final UserRepository userRepository;
	private final ServiceService serviceService;

	@Transactional
	public BookingResponse createBooking(String customerEmail, BookingCreateRequest req) {
		User customer = userRepository.findByEmail(customerEmail.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Customer not found"));
		if (customer.getRole() != Role.CUSTOMER) {
			throw new ResponseStatusException(FORBIDDEN, "Only CUSTOMER can create booking");
		}

		Booking booking = Booking.builder()
				.customer(customer)
				.service(serviceService.getByIdOrThrow(req.getServiceId()))
				.description(req.getDescription())
				.imageUrl(req.getImageUrl())
				.status(BookingStatus.PENDING)
				.build();

		booking = bookingRepository.save(booking);
		return toResponse(booking);
	}

	@Transactional
	public BookingResponse acceptBooking(String technicianEmail, Long bookingId) {
		User tech = userRepository.findByEmail(technicianEmail.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Technician not found"));
		if (tech.getRole() != Role.TECHNICIAN) {
			throw new ResponseStatusException(FORBIDDEN, "Only TECHNICIAN can accept booking");
		}

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Booking not found"));
		if (booking.getTechnician() != null) {
			throw new ResponseStatusException(BAD_REQUEST, "Booking already accepted");
		}
		if (booking.getStatus() != BookingStatus.PENDING) {
			throw new ResponseStatusException(BAD_REQUEST, "Only PENDING booking can be accepted");
		}
		booking.setTechnician(tech);
		booking.setStatus(BookingStatus.ACCEPTED);
		return toResponse(booking);
	}

	@Transactional
	public BookingResponse updateStatus(String actorEmail, Long bookingId, BookingStatus status) {
		User actor = userRepository.findByEmail(actorEmail.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Booking not found"));

		// Only assigned technician can update status (simple rule)
		if (actor.getRole() == Role.TECHNICIAN) {
			if (booking.getTechnician() == null || !booking.getTechnician().getId().equals(actor.getId())) {
				throw new ResponseStatusException(FORBIDDEN, "You are not assigned to this booking");
			}
			booking.setStatus(status);
			return toResponse(booking);
		}

		// Admin can update anything
		if (actor.getRole() == Role.ADMIN) {
			booking.setStatus(status);
			return toResponse(booking);
		}

		throw new ResponseStatusException(FORBIDDEN, "Not allowed to update booking status");
	}

	public List<BookingResponse> listMyBookings(String email) {
		User u = userRepository.findByEmail(email.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
		if (u.getRole() == Role.CUSTOMER) {
			return bookingRepository.findByCustomerId(u.getId()).stream().map(this::toResponse).toList();
		}
		if (u.getRole() == Role.TECHNICIAN) {
			return bookingRepository.findByTechnicianId(u.getId()).stream().map(this::toResponse).toList();
		}
		return bookingRepository.findAll().stream().map(this::toResponse).toList();
	}

	public Booking getByIdOrThrow(Long id) {
		return bookingRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Booking not found"));
	}

	public BookingResponse toResponse(Booking b) {
		return BookingResponse.builder()
				.id(b.getId())
				.customerId(b.getCustomer() == null ? null : b.getCustomer().getId())
				.technicianId(b.getTechnician() == null ? null : b.getTechnician().getId())
				.serviceId(b.getService() == null ? null : b.getService().getId())
				.description(b.getDescription())
				.imageUrl(b.getImageUrl())
				.status(b.getStatus())
				.createdAt(b.getCreatedAt())
				.build();
	}
}

