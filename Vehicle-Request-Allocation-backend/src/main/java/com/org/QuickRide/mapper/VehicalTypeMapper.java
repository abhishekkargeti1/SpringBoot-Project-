package com.org.QuickRide.mapper;

import java.util.ArrayList;
import java.util.List;

import com.org.QuickRide.dto.VehicleTypeDTO;
import com.org.QuickRide.entities.VehicalTypeEntity;

public class VehicalTypeMapper {

	private static VehicleTypeDTO dto;

	public static List<VehicleTypeDTO> getDto(List<VehicalTypeEntity> entityList) {
		List<VehicleTypeDTO> dtoList = new ArrayList<>();

		for (VehicalTypeEntity e : entityList) {
			dto = new VehicleTypeDTO();
			dto.setId(e.getId());
			dto.setVehicalType(e.getVehicalType());
			dto.setStatus(e.getStatus());
			dtoList.add(dto);
		}
		return dtoList;
	}

}
