package com.org.QuickRide.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.dto.DriverDetailsDTO;
import com.org.QuickRide.serviceimpl.DriverSelectionServiceImpl;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class DriverSelectionController {

	@Autowired
	private DriverSelectionServiceImpl driverSelectionService;

	@GetMapping("/getDriver/{carType}")
	public ResponseEntity<?> getDriverDetails(@PathVariable String carType) {

//		System.out.println("CarType is " + carType);

		DriverDetailsDTO assignedDriver = driverSelectionService.findDriver(carType);

		return ResponseEntity.status(HttpStatus.OK).body(assignedDriver);
	}

}
