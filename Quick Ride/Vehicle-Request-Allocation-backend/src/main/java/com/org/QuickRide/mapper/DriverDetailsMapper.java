package com.org.QuickRide.mapper;

import com.org.QuickRide.dto.CarDetailsDTO;
import com.org.QuickRide.dto.DriverDetailsDTO;
import com.org.QuickRide.dto.DriverRegistrationDetailsDTO;
import com.org.QuickRide.dto.VehicleTypeDTO;
import com.org.QuickRide.entities.DriverDetailsEntity;

public class DriverDetailsMapper {

	public static DriverDetailsEntity toEntity(DriverRegistrationDetailsDTO dto) {

		DriverDetailsEntity entity = new DriverDetailsEntity();

		entity.setFirstName(dto.getFirstName());
		entity.setMiddleName(dto.getMiddleName());
		entity.setLastName(dto.getLastName());
		entity.setContactNumber(dto.getContactNumber());
		entity.setEmail(dto.getEmail());
		entity.setAadhaarCardNumber(dto.getAadhaarCardNumber());
		entity.setPoliceVerificationExpiry(dto.getPoliceVerificationExpiry());
		entity.setPoliceVerificationFileName(dto.getPoliceVerificationFileName());
		entity.setAadhaarCardFileName(dto.getAadhaarCardFileName());
		entity.setVehicalType(dto.getVehicalType());

		return entity;
	}

	public static DriverDetailsDTO getDriverDetailsSelectionDTO(DriverDetailsEntity driverDetails) {
		DriverDetailsDTO dto = new DriverDetailsDTO();
		dto.setId(driverDetails.getId());
		dto.setFirstName(driverDetails.getFirstName());
		dto.setMiddleName(driverDetails.getMiddleName());
		dto.setLastName(driverDetails.getLastName());
		dto.setContactNumber(driverDetails.getContactNumber());
		return dto;
	}

	public static DriverRegistrationDetailsDTO getDriverDetailsDTO(DriverDetailsEntity entity) {
		DriverRegistrationDetailsDTO dto = new DriverRegistrationDetailsDTO();

		dto.setDriverId(String.valueOf(entity.getId()));
		dto.setFirstName(entity.getFirstName());
		dto.setMiddleName(entity.getMiddleName());
		dto.setLastName(entity.getLastName());
		dto.setContactNumber(entity.getContactNumber());
		dto.setEmail(entity.getEmail());
		dto.setAadhaarCardNumber(entity.getAadhaarCardNumber());
		dto.setPoliceVerificationExpiry(entity.getPoliceVerificationExpiry());
		dto.setPoliceVerificationFileName(entity.getPoliceVerificationFileName());
		dto.setAadhaarCardFileName(entity.getAadhaarCardFileName());

		dto.setVehicalType(entity.getVehicalType());

		// ✅ Set Car Details DIRECTLY from entity
		if (entity.getCarDetails() != null) {
			CarDetailsDTO vehicleDto = new CarDetailsDTO();
			vehicleDto.setId(entity.getCarDetails().getId());
			vehicleDto.setCarRegistrationNumber(entity.getCarDetails().getCarRegistrationNumber());
			vehicleDto.setDriverId(entity.getCarDetails().getDriverId());
			vehicleDto.setRegistrationCardFileName(entity.getCarDetails().getRegistrationCardFileName());
			vehicleDto.setYearOfExpire(entity.getCarDetails().getYearOfExpire());
			dto.setCarDetails(vehicleDto);
		}
		// Transient / derived values
		dto.setDriverRating(entity.getDriverRating());
		dto.setDriverDutyStatus(entity.getDriverDutyStatus());
		dto.setVehicleTypeName(entity.getVehicleTypeName());

		return dto;
	}

}
