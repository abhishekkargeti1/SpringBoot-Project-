package com.org.QuickRide.helper;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordHashService {

	private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public static String getEncodePassword(String userPassword) {
		String hashedPassword = passwordEncoder.encode(userPassword);
		return hashedPassword;
	}
	


	public static Boolean passwordMatcher(String hashedPassword, String rawPassword) {

		boolean matches = passwordEncoder.matches(rawPassword, hashedPassword);
		return matches;
	}

}
