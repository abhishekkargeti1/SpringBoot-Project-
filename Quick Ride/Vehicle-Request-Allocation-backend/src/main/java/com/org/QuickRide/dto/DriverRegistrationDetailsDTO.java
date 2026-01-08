package com.org.QuickRide.dto;

import org.springframework.web.multipart.MultipartFile;

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
	private int vehicalType;
	private CarDetailsDTO carDetails;
	private String aadhaarCardNumber;
	private MultipartFile aadhaarCard;
	private String policeVerificationExpiry;
	private MultipartFile policeVerificationCertificate;
	private String policeVerificationFileName;
	private String aadhaarCardFileName;	
	private String driverRating;
	private String driverDutyStatus;
	private String vehicleTypeName;
}
