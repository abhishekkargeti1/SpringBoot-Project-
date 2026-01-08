package com.org.QuickRide.mapper;

import com.org.QuickRide.dto.CarDetailsDTO;
import com.org.QuickRide.entities.CarDetailsEntity;

public class CarDetailsMapper {

	public static CarDetailsEntity toEntity(CarDetailsDTO dto) {

		CarDetailsEntity entity = new CarDetailsEntity();

		entity.setCarRegistrationNumber(dto.getCarRegistrationNumber());
		entity.setDriverId(dto.getDriverId());
		entity.setYearOfExpire(dto.getYearOfExpire());
		entity.setRegistrationCardFileName(dto.getRegistrationCardFileName());

		return entity;
	}
}
