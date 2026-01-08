package com.org.QuickRide.dto;

import lombok.Data;

@Data
public class ForgetPasswordDTO {
	
	private String email;
	private String newPassword;
	private String otp;
	

}
