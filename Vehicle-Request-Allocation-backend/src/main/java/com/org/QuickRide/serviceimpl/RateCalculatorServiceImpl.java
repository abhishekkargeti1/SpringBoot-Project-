package com.org.QuickRide.serviceimpl;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.QuickRide.entities.RateListEntity;
import com.org.QuickRide.helper.RateCalculator;
import com.org.QuickRide.respositories.RateListRepository;
import com.org.QuickRide.service.RateCalculatorService;

@Service
public class RateCalculatorServiceImpl implements RateCalculatorService{
	
	
	@Autowired
	private RateListRepository rateListRepo;
	

	@Override
	public Map<String , Object> tripAmountCalculator(double tripDistance,int vehicleTypeId, boolean roundTrip) {
		
		RateListEntity rateByVehicleType = rateListRepo.getRateByVehicleType(vehicleTypeId);
		
		//System.out.println("Rate By Vehicle Type "+rateByVehicleType);
		
		Map<String , Object> response = RateCalculator.getFinalTripAmount(rateByVehicleType.getRatePerKm(),tripDistance,roundTrip);
		return response;
	}

	
}
