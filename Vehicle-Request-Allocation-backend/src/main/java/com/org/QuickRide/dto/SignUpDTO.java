package com.org.QuickRide.dto;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class SignUpDTO  {
	
	private int id;
	@NotBlank(message="Please Enter First Name")
	private String firstName;
	private String middleName;
	@NotBlank(message="Please Enter Last Name")
	private String lastName;
	@NotBlank(message="Please Enter Email Address")
	@Email(message="Please Enter Valid Email Address")
	private String email;
	@NotBlank(message="Please Enter Password")
	//@JsonIgnore
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String password;
	@NotBlank(message="Please Enter Contact Number")
	private String contactNumber;
}
