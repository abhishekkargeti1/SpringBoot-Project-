package com.org.QuickRide.helper;

public class OTPGenerater {

	public static String otp() {
		String otp ="";
		
		for (int i = 0; i <= 4; i++) {
			int randomValue = (int) ((Math.floor(Math.random() * 10)));
			//System.out.println(randomValue);
			otp += Integer.toString(randomValue);
		}
		System.out.println(otp);
		return otp;
	}
}
