package com.fixnow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class FixnowBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FixnowBackendApplication.class, args);
	}

	@Bean
	CommandLineRunner alterStatusColumn(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				// Hibernate 6 maps Enums to MySQL ENUM. Since we added CANCELLED later, the MySQL column was rejecting it.
				// This forced cast to VARCHAR(50) prevents the Data Truncated error.
				jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN status VARCHAR(50)");
			} catch(Exception e) {
				// Silently fail if already altered
			}
		};
	}
}

