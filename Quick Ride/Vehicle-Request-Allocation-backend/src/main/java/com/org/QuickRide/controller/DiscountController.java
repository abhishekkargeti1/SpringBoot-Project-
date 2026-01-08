package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.serviceimpl.DiscountServiceImpl;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class DiscountController {
	
	@Autowired
	private DiscountServiceImpl discountSerivceImpl;

	@GetMapping("/getDicount/{couponCode}/{tripAmount}")
	public ResponseEntity<?> getDiscount(@PathVariable String couponCode, @PathVariable double tripAmount) {
		System.out.println("tripAmount "+tripAmount+" "+" couponCode "+couponCode);
		double discountedAmount = discountSerivceImpl.getDiscount(tripAmount, couponCode);
		Map<String, Object> response = new HashMap<>();
		response.put("Final Amount", discountedAmount);
		return ResponseEntity.status(HttpStatus.OK).body(response);

	}

}
