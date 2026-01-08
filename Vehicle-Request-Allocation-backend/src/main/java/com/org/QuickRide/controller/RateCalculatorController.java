package com.org.QuickRide.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.serviceimpl.RateCalculatorServiceImpl;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class RateCalculatorController {

	@Autowired
	private RateCalculatorServiceImpl rateCalculatorService;

	@GetMapping("/calculateAmount/{vehicleType}/{tripDistance}/{roundTrip}")
	public ResponseEntity<?> getTripAmount(@PathVariable double tripDistance, @PathVariable int vehicleType,
			@PathVariable boolean roundTrip) {
//		System.out.println("Round Trip Value "+roundTrip);

		Map<String, Object> tripAmountCalculator = rateCalculatorService.tripAmountCalculator(tripDistance, vehicleType,
				roundTrip);

		// System.out.println("Final Response "+tripDistance);
		return ResponseEntity.status(HttpStatus.OK).body(tripAmountCalculator);
	}

}
