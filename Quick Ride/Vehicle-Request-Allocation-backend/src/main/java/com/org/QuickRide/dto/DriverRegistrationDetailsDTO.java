package com.org.QuickRide.dto;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class DriverRegistrationDetailsDTO {
	
	private String driverId;
	private String firstName;
	private String middleName;
	private String lastName;
	private String contactNumber;
	private String email;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private int vehicalType;
	@JsonProperty("Car Details")
	private CarDetailsDTO carDetails;
	private String aadhaarCardNumber;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private MultipartFile aadhaarCard;
	private String policeVerificationExpiry;
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private MultipartFile policeVerificationCertificate;
	private String policeVerificationFileName;
	private String aadhaarCardFileName;	
	private String driverRating;
	private String driverDutyStatus;
	private String vehicleTypeName;
}
