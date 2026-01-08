package com.org.QuickRide.serviceimpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.QuickRide.entities.DiscountEntity;
import com.org.QuickRide.helper.RateCalculator;
import com.org.QuickRide.respositories.DiscountRespository;
import com.org.QuickRide.service.DiscountService;

@Service
public class DiscountServiceImpl implements DiscountService {

	@Autowired
	private DiscountRespository discountRespo;

	@Override
	public double getDiscount(double tripAmount, String couponCode) {

		DiscountEntity discountCodeStatus = discountRespo.getDiscountCodeStatus(couponCode);

		System.out.println("Discount Code Value " + discountCodeStatus);
		
		
		
		if(discountCodeStatus == null) {
			
			throw new RuntimeException("Invalid Coupon Code");			
		}
		
		String status = discountCodeStatus.getStatus();
		
		if ("A".equals(status)) {
			double discountedRate = RateCalculator.getDiscountedRate(couponCode, tripAmount);
			return discountedRate;

		}else {
			throw new RuntimeException("Coupon Code is Not Active");			
		}

	}

}
