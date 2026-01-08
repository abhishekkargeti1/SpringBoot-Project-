package com.org.QuickRide.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginCredentialDTO {

	
	@NotBlank(message="Please Enter Username")
	@Email(message="Please Enter Valid Email")
	private String userName;
	@NotBlank(message="Please Enter Valid password")
	private String password;	
	




}


