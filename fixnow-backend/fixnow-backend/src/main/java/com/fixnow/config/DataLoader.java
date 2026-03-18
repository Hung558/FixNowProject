package com.fixnow.config;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fixnow.entity.Service;
import com.fixnow.repository.BookingRepository;
import com.fixnow.repository.ReviewRepository;
import com.fixnow.repository.ServiceRepository;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(ServiceRepository repository, BookingRepository bookingRepository, ReviewRepository reviewRepository) {
        return args -> {
            // Force refresh for development to match user's new requirements
            // Need to delete in correct order due to foreign key constraints: 
            // Reviews -> Bookings -> Services
            reviewRepository.deleteAll();
            bookingRepository.deleteAll();
            repository.deleteAll();
            
            repository.saveAll(List.of(
                Service.builder()
                    .name("Sửa điện thoại")
                    .description("Sửa chữa phần cứng, màn hình, pin Smartphone.")
                    .price(new BigDecimal("500000"))
                    .build(),
                Service.builder()
                    .name("Sửa laptop")
                    .description("Sửa nguồn, thay linh kiện, cài đặt Laptop.")
                    .price(new BigDecimal("800000"))
                    .build(),
                Service.builder()
                    .name("Vệ sinh máy")
                    .description("Vệ sinh, bảo dưỡng Điện thoại/Laptop chuyên sâu.")
                    .price(new BigDecimal("200000"))
                    .build(),
                Service.builder()
                    .name("Nâng cấp máy")
                    .description("Nâng cấp RAM, SSD, linh kiện chính hãng.")
                    .price(new BigDecimal("1000000"))
                    .build()
            ));
        };
    }
}
