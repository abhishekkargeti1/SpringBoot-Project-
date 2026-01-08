package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.dto.VehicleDetailsDTO;
import com.org.QuickRide.dto.VehicleTypeDTO;
import com.org.QuickRide.serviceimpl.VehicleDetailsServiceImpl;
import com.org.QuickRide.serviceimpl.VehicleTypeServiceImpl;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class VehicleController {

	@Autowired
	private VehicleTypeServiceImpl vehicalService;
	
	@Autowired
	private VehicleDetailsServiceImpl vehicalTypeService;

	@GetMapping("/getVehicalTypeDetails")
	public ResponseEntity<?> getVehicalType() {
		List<VehicleTypeDTO> details = vehicalService.getVehicalType();
		Map<String, Object> response = new HashMap<>();
		response.put("details", details);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	
	@GetMapping("/getVehicalDetails/{vehical_type_id}")
	public ResponseEntity<?> getVehicalDetails(@PathVariable int vehical_type_id){
		//System.out.println("vehical_type_id "+vehical_type_id);
		List<VehicleDetailsDTO> vehicalDetails = vehicalTypeService.getVehicalDetails(vehical_type_id);
		Map<String, Object> response = new HashMap<>();
		response.put("details", vehicalDetails);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}
	
	
}
