package com.org.QuickRide.mapper;

import java.util.ArrayList;
import java.util.List;

import com.org.QuickRide.dto.BookingDetailsDTO;
import com.org.QuickRide.dto.DriverDetailsDTO;
import com.org.QuickRide.entities.BookingDetailsEntity;

public class BookingDetailsMapper {

	public static BookingDetailsEntity getEntity(String from, String to, int customerId, int vehicleTypeId,
			int selectedCarId, int driverId, String distance, String timeDuration, String amountToPaid,
			String paymentType, String status) {

		BookingDetailsEntity entity = new BookingDetailsEntity();
		entity.setFrom(from);
		entity.setTo(to);
		entity.setCustomerId(customerId);
		entity.setVehicleTypeId(vehicleTypeId);
		entity.setSelectedCarId(selectedCarId);
		entity.setDriverId(driverId);
		entity.setDistance(distance);
		entity.setTimeDuration(timeDuration);
		entity.setAmountToPaid(amountToPaid);
		entity.setPaymentType(paymentType);
		entity.setStatus(status);
		return entity;

	}

	public static List<BookingDetailsDTO> getDTO(List<BookingDetailsEntity> entityList) {

		List<BookingDetailsDTO> dtoList = new ArrayList<>();
		
		BookingDetailsDTO dto = null;

		for (BookingDetailsEntity entity : entityList) {
			dto = new BookingDetailsDTO();
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
	            driverDTO.setId(entity.getDriverDetails().getId());
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
