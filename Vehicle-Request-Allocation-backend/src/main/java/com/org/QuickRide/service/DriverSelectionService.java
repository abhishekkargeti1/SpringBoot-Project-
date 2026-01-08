package com.org.QuickRide.service;

import java.util.List;

import com.org.QuickRide.dto.DriverDetailsDTO;
import com.org.QuickRide.entities.FindDriverEntity;

public interface DriverSelectionService {

	public DriverDetailsDTO findDriver(String carType);
	public FindDriverEntity assignDriver(List<FindDriverEntity> drivers);
}
