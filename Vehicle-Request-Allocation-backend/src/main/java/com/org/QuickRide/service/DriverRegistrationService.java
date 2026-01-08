package com.org.QuickRide.service;

import com.org.QuickRide.dto.DriverLoginDTO;
import com.org.QuickRide.dto.DriverRegistrationDetailsDTO;

public interface DriverRegistrationService {

	
	public boolean getDriverRegistrated(DriverRegistrationDetailsDTO driverDetails) ;
	
	public DriverRegistrationDetailsDTO getDriverLogin(DriverLoginDTO driverLoginDetails);
	
}
