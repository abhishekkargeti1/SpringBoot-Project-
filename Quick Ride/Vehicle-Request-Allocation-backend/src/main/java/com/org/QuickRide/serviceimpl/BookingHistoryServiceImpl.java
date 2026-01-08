package com.org.QuickRide.serviceimpl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.QuickRide.customexception.ResourceNotFoundException;
import com.org.QuickRide.dto.BookingHistoryDTO;
import com.org.QuickRide.entities.BookingHistoryEntity;
import com.org.QuickRide.entities.DriverDetailsEntity;
import com.org.QuickRide.entities.DriverRatingEntity;
import com.org.QuickRide.entities.VehicalDetailsEntity;
import com.org.QuickRide.entities.VehicalTypeEntity;
import com.org.QuickRide.mapper.BookingHistoryMapper;
import com.org.QuickRide.respositories.BookingHistoryRespository;
import com.org.QuickRide.respositories.DriverDetailsRespository;
import com.org.QuickRide.respositories.DriverDutyRespository;
import com.org.QuickRide.respositories.DriverRatingRespository;
import com.org.QuickRide.respositories.VehicleDetailsRepository;
import com.org.QuickRide.respositories.VehicleTypeRepository;
import com.org.QuickRide.service.BookingHistoryService;

@Service
public class BookingHistoryServiceImpl implements BookingHistoryService {

	@Autowired
	private BookingHistoryRespository bookingHistoryRespository;
	@Autowired
	private DriverDutyRespository driverDutyRepo;

	@Autowired
	private VehicleDetailsRepository carDetailsRepository;

	@Autowired
	private VehicleTypeRepository vehicleTypeRepository;

	@Autowired
	private DriverDetailsRespository driverDetailsRespository;

	@Autowired
	private DriverRatingRespository driverRatingRespository;

	@Override
	public List<BookingHistoryDTO> getBookingHistory(String userId) {

		//System.out.println("User Id in Service " + userId);

		List<BookingHistoryEntity> bookingHistory = bookingHistoryRespository.getBookingHistory(userId);

		System.out.println("ByBooking id "+bookingHistory);
		if (bookingHistory.isEmpty()) {

			throw new ResourceNotFoundException("No Booking Found");
		}

		for (BookingHistoryEntity entity : bookingHistory) {
			
			//System.out.println("entity.getSelectedCarId() "+entity.getSelectedCarId());
			Optional<VehicalDetailsEntity> getCarDetailsById = carDetailsRepository.findById(entity.getSelectedCarId());
			
			Optional<VehicalTypeEntity> getVehicleDetailsById = vehicleTypeRepository
					.findById(entity.getVehicleTypeId());
			
			Optional<DriverDetailsEntity> getDriverDetailById = driverDetailsRespository.findById(entity.getDriverId());

			if (getCarDetailsById.isPresent()) {
				//System.out.println("Heelo World");
				VehicalDetailsEntity vehicleEntity = getCarDetailsById.get();
				entity.setVehicleName(vehicleEntity.getName());
			}

			if (getVehicleDetailsById.isPresent()) {
				VehicalTypeEntity carEntity = getVehicleDetailsById.get();
				entity.setCarName(carEntity.getVehicalType());
			}

			if (getDriverDetailById.isPresent()) {
				DriverDetailsEntity driverDetailsEntity = getDriverDetailById.get();
				 //System.out.println("driverDetailsEntity.getId() "+driverDetailsEntity.getId());
				Optional<DriverRatingEntity> getDriverRatingbyId = driverRatingRespository
						.findById(driverDetailsEntity.getId());

				if (getDriverRatingbyId.isPresent()) {
					DriverRatingEntity driverRatingEntity = getDriverRatingbyId.get();
					String driverRating = driverRatingEntity.getRating();
					driverDetailsEntity.setDriverRating(driverRating);
				}

				entity.setDriverDetails(driverDetailsEntity);
			}

		}
		 List<BookingHistoryDTO> dtoList =  BookingHistoryMapper.getDTO(bookingHistory);
		//System.out.println("Booking Details in service "+ byBookingId);
		return dtoList;
	}

}
