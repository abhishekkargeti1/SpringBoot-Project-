package com.org.QuickRide.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class CarDetailsDTO {

	
	private int id;
	private int driverId;
	private String carRegistrationNumber;
	private String yearOfExpire;
	private MultipartFile registrationCard;
	private String registrationCardFileName;
	
	
}
	
