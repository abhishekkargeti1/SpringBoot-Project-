package com.org.QuickRide.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class BookingDetailsDTO {

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
	@JsonProperty(defaultValue = "Driver Details",access = JsonProperty.Access.READ_ONLY)
	private DriverDetailsDTO driverDetails;
	private String distance;
	private String timeDuration;
	private String amountToPaid;
	private String paymentType;
	@JsonProperty(defaultValue = "Payment Status",access = JsonProperty.Access.READ_WRITE)
	private String status;
	@JsonProperty(defaultValue ="Trip Status",access = JsonProperty.Access.READ_ONLY)
	private String tripStatus;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String rating;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String vehicleName;
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
	private String carName;	
	
	
	
}
