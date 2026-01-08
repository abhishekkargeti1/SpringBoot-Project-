package com.org.QuickRide.mapper;

import java.util.ArrayList;
import java.util.List;

import com.org.QuickRide.dto.BookingHistoryDTO;
import com.org.QuickRide.dto.DriverDetailsDTO;
import com.org.QuickRide.entities.BookingHistoryEntity;

public class BookingHistoryMapper {
	
	public static List<BookingHistoryDTO> getDTO(List<BookingHistoryEntity> entityList) {

		List<BookingHistoryDTO> dtoList = new ArrayList<>();
		
		BookingHistoryDTO dto = null;

		for (BookingHistoryEntity entity : entityList) {
			dto = new BookingHistoryDTO();
			dto.setId(entity.getId());
			dto.setFrom(entity.getFrom());
			dto.setTo(entity.getTo());
			dto.setCustomerId(entity.getCustomerId());
			dto.setVehicleName(entity.getVehicleName());
			dto.setCarName(entity.getCarName());
			dto.setDistance(entity.getDistance());
			dto.setTimeDuration(entity.getTimeDuration());
			dto.setAmountToPaid(entity.getAmountToPaid());
			dto.setPaymentType(entity.getPaymentType());
			dto.setStatus(entity.getStatus());
			dto.setTripStatus(entity.getTripStatus());
			
			if (entity.getDriverDetails() != null) {
	            DriverDetailsDTO driverDTO = new DriverDetailsDTO();
	           // driverDTO.setId(entity.getDriverDetails().getId());
	            driverDTO.setFirstName(entity.getDriverDetails().getFirstName());
	            driverDTO.setMiddleName(entity.getDriverDetails().getMiddleName());
	            driverDTO.setLastName(entity.getDriverDetails().getLastName());
	            driverDTO.setContactNumber(entity.getDriverDetails().getContactNumber());
	            driverDTO.setDriverRating(entity.getDriverDetails().getDriverRating());	            
	            dto.setDriverDetails(driverDTO);
	        }
			
			dtoList.add(dto);
		}

		return dtoList;

	}


}
