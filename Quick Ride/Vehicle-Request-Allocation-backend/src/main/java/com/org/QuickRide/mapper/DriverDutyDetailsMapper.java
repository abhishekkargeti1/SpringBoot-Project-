package com.org.QuickRide.mapper;

import com.org.QuickRide.entities.DriverDutyDetails;

public class DriverDutyDetailsMapper {

	public static DriverDutyDetails getEntity(int driverId, int customerId, String to, String from, String tripAmount,
			String paymentType, String paymentStatus, String tripDistance) {
		
		DriverDutyDetails entity = new DriverDutyDetails();
		
		
		entity.setCustomerId(customerId);
		entity.setDriverId(driverId);
		entity.setDestinationPoint(to);
		entity.setPickUpPoint(from);
		entity.setTripAmount(tripAmount);
		entity.setPaymentStatus(paymentStatus);
		entity.setPaymentType(paymentType);
		entity.setTripDistance(tripDistance);
		return entity;
	}
}
