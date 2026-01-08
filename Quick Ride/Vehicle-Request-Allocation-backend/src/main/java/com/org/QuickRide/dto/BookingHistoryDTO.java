package com.org.QuickRide.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.ToString;
@Data
@ToString
public class BookingHistoryDTO {
	private int id;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String razorpayPaymentId;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String razorpayOrderId;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String razorpaySignature;
	private String from;
	private String to;
	private int customerId;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private int vehicleTypeId;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private int selectedCarId;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private int driverId;
	@JsonProperty("Driver Details")
	private DriverDetailsDTO driverDetails;
	private String distance;
	private String timeDuration;
	private String amountToPaid;
	private String paymentType;
	@JsonProperty("Payment Status")
	private String status;
	@JsonProperty("Trip Status")
	private String tripStatus;
	private String rating;
	private String vehicleName;
	private String carName;	
}
