package com.fixnow.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fixnow.dto.StoreRequest;
import com.fixnow.dto.StoreResponse;
import com.fixnow.entity.Role;
import com.fixnow.entity.Store;
import com.fixnow.entity.User;
import com.fixnow.repository.StoreRepository;
import com.fixnow.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    @Transactional
    public StoreResponse createStore(String email, StoreRequest request) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (user.getRole() != Role.TECHNICIAN && user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(FORBIDDEN, "Only technicians or admins can create a store");
        }

        if (user.getStore() != null) {
            throw new ResponseStatusException(BAD_REQUEST, "User is already a member of a store");
        }

        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (storeRepository.existsByStoreCode(code));

        Store store = Store.builder()
                .name(request.getName())
                .address(request.getAddress())
                .storeCode(code)
                .build();

        store = storeRepository.save(store);
        user.setStore(store);
        userRepository.save(user);

        return toResponse(store);
    }

    @Transactional
    public StoreResponse joinStore(String email, String storeCode) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        if (user.getRole() != Role.TECHNICIAN) {
            throw new ResponseStatusException(FORBIDDEN, "Only technicians can join a store");
        }

        Store store = storeRepository.findByStoreCode(storeCode.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Store code not found"));

        user.setStore(store);
        userRepository.save(user);

        return toResponse(store);
    }

    public StoreResponse getStoreByCode(String storeCode) {
        Store store = storeRepository.findByStoreCode(storeCode.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Store not found"));
        return toResponse(store);
    }

    public StoreResponse toResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .storeCode(store.getStoreCode())
                .build();
    }
}
