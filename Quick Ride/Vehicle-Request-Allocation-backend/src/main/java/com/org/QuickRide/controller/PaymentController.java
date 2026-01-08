package com.org.QuickRide.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class PaymentController {

	@Value("${payment.gateway.key_id}")
	private String keyId;

	@Value("${payment.gateway.key_secret}")
	private String secretKey;

	@PostMapping("/create_order")
	public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {

		BigDecimal amountRupees = new BigDecimal(data.get("amount").toString());

		// Convert to paise safely
		long amountPaise = amountRupees.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();

		// ₹10,00,000 = 1,00,00,000 paise
		if (amountPaise > 100_000_000L) {
			return ResponseEntity.badRequest().body("Maximum allowed amount is ₹10,00,000");
		}

		try {
			RazorpayClient client = new RazorpayClient(keyId, secretKey);

			JSONObject options = new JSONObject();
			options.put("amount", amountPaise);
			options.put("currency", "INR");
			options.put("receipt", "txn_" + System.currentTimeMillis());

			Order order = client.Orders.create(options);

			Map<String, Object> response = new HashMap<>();
			response.put("order", new JSONObject(order.toString()).toMap());
			response.put("keyId", keyId);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			throw new RuntimeException("Something went wrong in Payment Gateway", e);
		}
	}
}