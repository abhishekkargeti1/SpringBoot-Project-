package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.dto.BookingDetailsDTO;
import com.org.QuickRide.serviceimpl.BookingServiceImpl;

@RestController
@RequestMapping("/api/v1")
public class BookingController {

	@Autowired
	private BookingServiceImpl bookingServiceImpl;

	@PostMapping("/bookingDetails")
	public ResponseEntity<?> getBookingConfirmation(@RequestBody BookingDetailsDTO bookingDetails) {
		System.out.println("Booking Details " + bookingDetails);

		int bookingId = bookingServiceImpl.getBookingDetails(bookingDetails);

		Map<String, Object> response = new HashMap<>();

		if (bookingId > 0) {
			response.put("Booking Status", "Confirm");
			response.put("Booking Id", bookingId);
			return ResponseEntity.status(HttpStatus.OK).body(response);

		} else {
			response.put("Booking Status", "Failed");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

		}

	}

	@GetMapping("/bookingDetails/{bookingId}")
	public ResponseEntity<?> getBookingDetails(@PathVariable String bookingId) {
		//System.out.println("Booking Details Id " + bookingId);
		
		List<BookingDetailsDTO> bookingDetails = bookingServiceImpl.getBookingDetails(bookingId);
		
		Map<String, Object> response = new HashMap<>();
		response.put("Booking Details ", bookingDetails);
		
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

}
