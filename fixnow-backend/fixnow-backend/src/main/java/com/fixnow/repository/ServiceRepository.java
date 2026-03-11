package com.fixnow.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fixnow.entity.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}

