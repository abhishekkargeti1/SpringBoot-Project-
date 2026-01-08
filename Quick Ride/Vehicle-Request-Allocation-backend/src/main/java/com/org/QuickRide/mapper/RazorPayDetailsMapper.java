package com.org.QuickRide.mapper;

import com.org.QuickRide.entities.RazorPayDetailsEntity;

public class RazorPayDetailsMapper {

	public static RazorPayDetailsEntity getEnity(String razorpayPaymentId, String razorpayOrderId,
			String razorpaySignature, int customerId) {

		RazorPayDetailsEntity entity = new RazorPayDetailsEntity();
		entity.setRazorpayPaymentId(razorpayPaymentId);
		entity.setRazorpayOrderId(razorpayOrderId);
		entity.setRazorpaySignature(razorpaySignature);
		entity.setCustomerId(customerId);
		
		return entity;
	}

}
