package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.dto.BookingHistoryDTO;
import com.org.QuickRide.serviceimpl.BookingHistoryServiceImpl;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class BookingHistoryController {

	@Autowired
	private BookingHistoryServiceImpl bookingHistoryServiceImpl;

	@GetMapping("/bookingHistory/{userId}")
	public ResponseEntity<?> getBookingHistory(@PathVariable String userId) {

	//	System.out.println("User Id is " + userId);

		List<BookingHistoryDTO> bookingHistory = bookingHistoryServiceImpl.getBookingHistory(userId);

		Map<String, Object> response = new HashMap<>();
		response.put("Booking Details ", bookingHistory);

		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

}
