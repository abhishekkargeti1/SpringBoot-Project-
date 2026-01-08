package com.org.QuickRide.service;

import java.util.List;

import com.org.QuickRide.dto.VehicleDetailsDTO;

public interface VehicleDetailsService {

	List<VehicleDetailsDTO> getVehicalDetails(int vehical_type_id);
}
