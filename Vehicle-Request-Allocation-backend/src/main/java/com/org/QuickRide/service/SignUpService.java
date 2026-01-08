package com.org.QuickRide.service;

import com.org.QuickRide.dto.ForgetPasswordDTO;
import com.org.QuickRide.dto.LoginCredentialDTO;
import com.org.QuickRide.dto.SignUpDTO;
import com.org.QuickRide.dto.UserDetailsDTO;

public interface SignUpService {
	
	public SignUpDTO getUserSignUp(SignUpDTO userDetails);
	
	public SignUpDTO getUserLogin(LoginCredentialDTO credential);
		
	public Boolean checkEmailExists(String email);
	
	public void updateUserPassword(ForgetPasswordDTO userDetails);
	public void updateUserDetails(UserDetailsDTO userDetails);
}
