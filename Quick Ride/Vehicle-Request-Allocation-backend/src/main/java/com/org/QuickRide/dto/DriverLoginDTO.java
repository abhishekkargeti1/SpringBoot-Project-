package com.org.QuickRide.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class DriverLoginDTO {

	@Email
	@NotNull(message="Please Enter Valid Email")
	private String userName;
	@NotNull(message="Password Should Not be Null" )
	private String password;
}
