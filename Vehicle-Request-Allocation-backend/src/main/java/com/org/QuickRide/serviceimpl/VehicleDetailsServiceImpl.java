package com.org.QuickRide.serviceimpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.org.QuickRide.dto.VehicleDetailsDTO;
import com.org.QuickRide.entities.VehicalDetailsEntity;
import com.org.QuickRide.mapper.VehicalDetailsMapper;
import com.org.QuickRide.respositories.VehicleDetailsRepository;
import com.org.QuickRide.service.VehicleDetailsService;

@Service
public class VehicleDetailsServiceImpl implements VehicleDetailsService {
	
	@Autowired	
	private VehicleDetailsRepository vehicalDetailsRepo;

	@Override
	//@Cacheable(value = "VehicalDetailsCache", key = "'all'")
	public List<VehicleDetailsDTO> getVehicalDetails(int vehical_type_id) {
		//System.out.println("Vehical_Type_id "+vehical_type_id);
		List<VehicalDetailsEntity> details = vehicalDetailsRepo.getDetails(vehical_type_id);
		//System.out.println("Details are "+details);
		List<VehicleDetailsDTO> dto = VehicalDetailsMapper.getDto(details);
		return dto;
	}

	
}
