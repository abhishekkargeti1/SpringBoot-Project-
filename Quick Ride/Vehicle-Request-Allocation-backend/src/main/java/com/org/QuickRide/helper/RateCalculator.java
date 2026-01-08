package com.org.QuickRide.helper;

import java.util.HashMap;
import java.util.Map;

public class RateCalculator {

	private static double finalAmount;
	private static double amount;

	public static Map<String, Object> getFinalTripAmount(int perKmRate, double tripDistance, boolean roundTrip) {

		Map<String, Object> amountDetails = new HashMap<>();

		if (roundTrip) {
			 amount = tripDistance * perKmRate;
			//System.out.println("Amount in if "+ amount);
		} else {
			 amount = tripDistance * perKmRate;
			//System.out.println("Amount in else "+ amount);
		}
		double cGST = (amount * 0.05);
		double sGST = (amount * 0.05);

		finalAmount = (amount + sGST + cGST);
		// System.out.println("Amount is "+ amount+" "+" final Amount "+finalAmount);

		amountDetails.put("beforeGSTAmount", amount);
		amountDetails.put("SGST", sGST);
		amountDetails.put("CGST", cGST);
		amountDetails.put("finalAmount", finalAmount);
		//System.out.println("Amount Details  "+ amountDetails);
		return amountDetails;
	}
	
	
	
	public static double getDiscountedRate(String couponCode,double tripAmount) {
 
		switch (couponCode) {
		case "QUICKDF15": {
			tripAmount -= tripAmount*15/100;
			break;
		}
		case "QUICKDS20":{
			tripAmount -= tripAmount*20/100;
			break;
		}
		default:
			throw new IllegalArgumentException("Unexpected value: " + couponCode);
		}
		
		return tripAmount;
	}
		
		
		
		
		
		
		
		

}
