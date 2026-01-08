package com.org.QuickRide.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.org.QuickRide.respositories.DriverDetailsRespository;

@Component
public class IdGenerator {
	@Autowired
	private  DriverDetailsRespository driverDetailsRespository;
	
	private  boolean  existsById = false;

	public  int generateDriverId() {
		int id=0;
		existsById = driverDetailsRespository.existsById(id);
		//System.out.println("Status "+existsById);
		do {
			 id= (int) (Math.random() * 10000); // 0 to 9999
			
		} while (existsById); // ensure uniqueness
		return id;
	}
}
