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
import com.fixnow.entity.Store;
import com.fixnow.entity.User;
import com.fixnow.repository.StoreRepository;
import com.fixnow.repository.UserRepository;
import com.fixnow.repository.BookingRepository;

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
	private final StoreRepository storeRepository;

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

		if (req.getStoreCode() == null || req.getStoreCode().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Store code is required");
		}
		
		Store store = storeRepository.findByStoreCode(req.getStoreCode().toUpperCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Store not found with code: " + req.getStoreCode()));
		booking.setStore(store);

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

		// Security: Technician can only accept bookings from their store
		if (booking.getStore() == null || tech.getStore() == null || !booking.getStore().getId().equals(tech.getStore().getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Booking does not belong to your store");
		}

		booking.setTechnician(tech);
		booking.setStatus(BookingStatus.ACCEPTED);
		return toResponse(bookingRepository.save(booking));
	}

	@Transactional
	public BookingResponse updateStatus(String actorEmail, Long bookingId, BookingStatus status) {
		User actor = userRepository.findByEmail(actorEmail.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Booking not found"));

		System.out.println("[DEBUG] updateStatus - Actor: " + actor.getEmail() + " (" + actor.getRole() + ")");
		System.out.println("[DEBUG] Booking: " + booking.getId() + " Status: " + booking.getStatus());
		System.out.println("[DEBUG] Target Status: " + status);

		// Technician logic
		if (actor.getRole() == Role.TECHNICIAN) {
			// Allow technician to cancel ANY PENDING job (rejecting it for everyone)
			if (status == BookingStatus.CANCELLED && booking.getStatus() == BookingStatus.PENDING) {
				System.out.println("[DEBUG] Technician cancelling PENDING job.");
				
				// Security: Technician can only cancel PENDING bookings from their store
				if (booking.getStore() == null || actor.getStore() == null || !booking.getStore().getId().equals(actor.getStore().getId())) {
					throw new ResponseStatusException(FORBIDDEN, "Booking does not belong to your store");
				}

				booking.setStatus(BookingStatus.CANCELLED);
				return toResponse(bookingRepository.save(booking));
			}

			// For other updates, they must be the assigned technician
			if (booking.getTechnician() == null) {
				System.err.println("[DEBUG] 403: Booking has no technician assigned.");
				throw new ResponseStatusException(FORBIDDEN, "Booking has no technician assigned");
			}
			if (!booking.getTechnician().getId().equals(actor.getId())) {
				System.err.println("[DEBUG] 403: ID mismatch. Assigned: " + booking.getTechnician().getId() + ", Actor: " + actor.getId());
				throw new ResponseStatusException(FORBIDDEN, "You are not assigned to this booking");
			}
			booking.setStatus(status);
			return toResponse(bookingRepository.save(booking));
		}

		// Admin can update anything
		if (actor.getRole() == Role.ADMIN) {
			booking.setStatus(status);
			return toResponse(bookingRepository.save(booking));
		}

		System.err.println("[DEBUG] 403: Role not authorized. Current role: " + actor.getRole());
		throw new ResponseStatusException(FORBIDDEN, "Role not authorized to update status: " + actor.getRole());
	}

	public List<BookingResponse> listMyBookings(String email) {
		User u = userRepository.findByEmail(email.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));
		if (u.getRole() == Role.CUSTOMER) {
			return bookingRepository.findByCustomerId(u.getId()).stream().map(this::toResponse).toList();
		}
		if (u.getRole() == Role.TECHNICIAN) {
			if (u.getStore() == null) {
				return List.of();
			}
			// For technician, only show bookings assigned to them OR pending bookings in their store
			List<Booking> list = new java.util.ArrayList<>(bookingRepository.findByTechnicianId(u.getId()));
			list.addAll(bookingRepository.findByStoreIdAndStatus(u.getStore().getId(), BookingStatus.PENDING));
			return list.stream().distinct().map(this::toResponse).toList();
		}
		return bookingRepository.findAll().stream().map(this::toResponse).toList();
	}

	public List<BookingResponse> getAllAvailableBookings(String technicianEmail) {
		User tech = userRepository.findByEmail(technicianEmail.toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Technician not found"));

		if (tech.getStore() == null) {
			return List.of();
		}

		return bookingRepository.findByStoreIdAndStatus(tech.getStore().getId(), BookingStatus.PENDING)
				.stream().map(this::toResponse).toList();
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
				.storeCode(b.getStore() != null ? b.getStore().getStoreCode() : null)
				.build();
	}
}
