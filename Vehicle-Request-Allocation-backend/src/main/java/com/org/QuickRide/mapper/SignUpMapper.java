package com.org.QuickRide.mapper;

import com.org.QuickRide.dto.SignUpDTO;
import com.org.QuickRide.entities.SignUpEntity;

public class SignUpMapper {

	public static SignUpEntity getEntity(SignUpDTO dto) {
		
		SignUpEntity entity = new SignUpEntity();
		entity.setFirstName(dto.getFirstName());	
		entity.setMiddleName(dto.getMiddleName());
		entity.setLastName(dto.getLastName());
		entity.setContactNumber(dto.getContactNumber());
		entity.setEmail(dto.getEmail());
		entity.setPassword(dto.getPassword());
		return entity;
	}
	
	public static SignUpDTO getDTO(SignUpEntity entity) {
		
		SignUpDTO dto = new SignUpDTO();
		dto.setId(entity.getId());
		dto.setFirstName(entity.getFirstName());	
		dto.setMiddleName(entity.getMiddleName());
		dto.setLastName(entity.getLastName());
		dto.setContactNumber(entity.getContactNumber());
		dto.setEmail(entity.getEmail());
		//dto.setPassword(entity.getPassword());
		return dto;
	}

}
