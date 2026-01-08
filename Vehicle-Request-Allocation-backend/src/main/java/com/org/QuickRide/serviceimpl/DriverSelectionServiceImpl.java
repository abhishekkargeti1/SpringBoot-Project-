package com.org.QuickRide.serviceimpl;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.QuickRide.customexception.ResourceNotFoundException;
import com.org.QuickRide.dto.DriverDetailsDTO;
import com.org.QuickRide.entities.DriverDetailsEntity;
import com.org.QuickRide.entities.FindDriverEntity;
import com.org.QuickRide.mapper.DriverDetailsMapper;
import com.org.QuickRide.respositories.DriverDetailsRespository;
import com.org.QuickRide.respositories.FindDriver;
import com.org.QuickRide.service.DriverSelectionService;

@Service
public class DriverSelectionServiceImpl implements DriverSelectionService {

	@Autowired
	private FindDriver findDriver;

	@Autowired
	private DriverDetailsRespository driverDetailsRepo;

	@Override
	public DriverDetailsDTO findDriver(String carType) {
		//System.out.println("CarType is " + carType);
		List<FindDriverEntity> driver = findDriver.getDriver(carType);
		//System.out.println("In Find Driver Method "+driver);

		if (driver != null) {
			FindDriverEntity assignDriverDetails = assignDriver(driver);
			
			Long id = assignDriverDetails.getId();
			
			DriverDetailsEntity driverDetails = driverDetailsRepo.getDriverDetails(id);
			
			DriverDetailsDTO driverDetailsDTO = DriverDetailsMapper.getDriverDetailsSelectionDTO(driverDetails);
			
			String driverRating = Double.toString(assignDriverDetails.getRating())+" rating";
			System.out.println("Driver Rating "+driverRating); 
			driverDetailsDTO.setDriverRating(driverRating);
			
			return driverDetailsDTO;
		} else {
			throw new RuntimeException("Something Went Wrong in Driver Allocation ");
		}

	}

	@Override
	public FindDriverEntity assignDriver(List<FindDriverEntity> drivers) {

		// 1. Filter only available drivers
		List<FindDriverEntity> availableDrivers = drivers.stream()
				.filter(d -> "Available".equalsIgnoreCase(d.getOnDuty())).collect(Collectors.toList());

		if (availableDrivers.isEmpty()) {
			throw new ResourceNotFoundException("No Driver Available");
		}

		// 2. If only one available → assign directly
		if (availableDrivers.size() == 1) {
			return availableDrivers.get(0);
		}

		// 3. Find max rating among available drivers
		double maxRating = availableDrivers.stream().mapToDouble(FindDriverEntity::getRating).max().orElseThrow(null);

		// 4. Filter drivers with max rating
		List<FindDriverEntity> topRatedDrivers = availableDrivers.stream().filter(d -> d.getRating() == maxRating)
				.collect(Collectors.toList());

		// 5. If only one → assign
		if (topRatedDrivers.size() == 1) {
			return topRatedDrivers.get(0);
		}

		// 6. Rating tie → pick RANDOM
		FindDriverEntity selectedDriver = topRatedDrivers
				.get(ThreadLocalRandom.current().nextInt(topRatedDrivers.size()));

		return selectedDriver;
	}

}
