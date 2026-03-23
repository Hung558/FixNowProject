package com.fixnow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fixnow.dto.StoreRequest;
import com.fixnow.dto.StoreResponse;
import com.fixnow.service.StoreService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @PostMapping
    public ResponseEntity<StoreResponse> createStore(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StoreRequest request) {
        return ResponseEntity.ok(storeService.createStore(userDetails.getUsername(), request));
    }

    @PostMapping("/join")
    public ResponseEntity<StoreResponse> joinStore(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String code) {
        return ResponseEntity.ok(storeService.joinStore(userDetails.getUsername(), code));
    }

    @GetMapping("/{code}")
    public ResponseEntity<StoreResponse> getStoreByCode(@PathVariable String code) {
        return ResponseEntity.ok(storeService.getStoreByCode(code));
    }
}
