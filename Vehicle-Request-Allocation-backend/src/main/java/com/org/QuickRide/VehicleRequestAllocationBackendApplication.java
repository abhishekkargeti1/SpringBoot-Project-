package com.org.QuickRide;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class VehicleRequestAllocationBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(VehicleRequestAllocationBackendApplication.class, args);
	}

}
