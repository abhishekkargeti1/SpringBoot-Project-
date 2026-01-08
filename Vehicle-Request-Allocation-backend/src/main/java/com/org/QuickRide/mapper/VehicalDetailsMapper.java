package com.org.QuickRide.mapper;

import java.util.ArrayList;
import java.util.List;

import com.org.QuickRide.dto.VehicleDetailsDTO;
import com.org.QuickRide.entities.VehicalDetailsEntity;

public class VehicalDetailsMapper {

	private static VehicleDetailsDTO dto;

	public static List<VehicleDetailsDTO> getDto(List<VehicalDetailsEntity> entityList) {
		List<VehicleDetailsDTO> dtoList = new ArrayList<>();

		for (VehicalDetailsEntity e : entityList) {
			dto = new VehicleDetailsDTO();
			dto.setVehical_type_id(e.getId());
			dto.setName(e.getName());
			//dto.setVehicleType(e.getVehicleType());
			dto.setStatus(e.getStatus());
			dtoList.add(dto);
		}
		return dtoList;
	}

}
