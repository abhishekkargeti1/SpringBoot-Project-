package com.org.QuickRide.serviceimpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.org.QuickRide.dto.VehicleTypeDTO;
import com.org.QuickRide.entities.VehicalTypeEntity;
import com.org.QuickRide.mapper.VehicalTypeMapper;
import com.org.QuickRide.respositories.VehicleTypeRepository;
import com.org.QuickRide.service.VehicleTypeService;

@Service
public class VehicleTypeServiceImpl implements VehicleTypeService {
	
	@Autowired
	private VehicleTypeRepository vehicalRepository;

	@Override
	@Cacheable(value = "VehicalTypeCache", key = "'all'")
	public List<VehicleTypeDTO> getVehicalType() {
		List<VehicalTypeEntity> vehicalDetails = vehicalRepository.findAll();
		List<VehicleTypeDTO> dto = VehicalTypeMapper.getDto(vehicalDetails);
		return dto ;
	}
}
