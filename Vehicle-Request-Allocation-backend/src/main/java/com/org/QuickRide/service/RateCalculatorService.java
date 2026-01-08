package com.org.QuickRide.service;

import java.util.Map;

public interface RateCalculatorService {
	
	public Map<String , Object> tripAmountCalculator(double tripDistance,int vehicleType,boolean roundTrip);

}
