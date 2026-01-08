package com.org.QuickRide.serviceimpl;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.QuickRide.customexception.ResourceNotFoundException;
import com.org.QuickRide.dto.BookingDetailsDTO;
import com.org.QuickRide.entities.BookingDetailsEntity;
import com.org.QuickRide.entities.DriverDetailsEntity;
import com.org.QuickRide.entities.DriverDutyEntity;
import com.org.QuickRide.entities.DriverRatingEntity;
import com.org.QuickRide.entities.RazorPayDetailsEntity;
import com.org.QuickRide.entities.VehicalDetailsEntity;
import com.org.QuickRide.entities.VehicalTypeEntity;
import com.org.QuickRide.helper.OTPGenerater;
import com.org.QuickRide.helper.PasswordHashService;
import com.org.QuickRide.mapper.BookingDetailsMapper;
import com.org.QuickRide.mapper.RazorPayDetailsMapper;
import com.org.QuickRide.respositories.BookingDetailsRespository;
import com.org.QuickRide.respositories.DriverDetailsRespository;
import com.org.QuickRide.respositories.DriverDutyRespository;
import com.org.QuickRide.respositories.DriverRatingRespository;
import com.org.QuickRide.respositories.RazorPayDetailsRepository;
import com.org.QuickRide.respositories.VehicleDetailsRepository;
import com.org.QuickRide.respositories.VehicleTypeRepository;
import com.org.QuickRide.service.BookingService;

@Service
public class BookingServiceImpl implements BookingService {

	@Autowired
	private BookingDetailsRespository bookingDetailsRepo;

	@Autowired
	private RazorPayDetailsRepository razorPayDetailsRepo;

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
	public int getBookingDetails(BookingDetailsDTO bookingDetails) {

		try {
			if ("paid".equals(bookingDetails.getStatus())) {

				RazorPayDetailsEntity razorPayDetailsEntity = RazorPayDetailsMapper.getEnity(
						bookingDetails.getRazorpayPaymentId(), bookingDetails.getRazorpayOrderId(),
						bookingDetails.getRazorpaySignature(), bookingDetails.getCustomerId());

				RazorPayDetailsEntity razorPaysavedDetails = razorPayDetailsRepo.save(razorPayDetailsEntity);

				if (razorPaysavedDetails != null) {

					int saveBookingDetails = saveBookingDetails(bookingDetails);
					return saveBookingDetails;

				} else {
					throw new RuntimeException("Something Went Wrong in Saving Razor Pay  Details");
				}

			} else {

				int saveBookingDetails = saveBookingDetails(bookingDetails);
				return saveBookingDetails;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return 0;
	}

	public int saveBookingDetails(BookingDetailsDTO bookingDetails) {

		BookingDetailsEntity bookingDetailsEntity = BookingDetailsMapper.getEntity(bookingDetails.getFrom(),
				bookingDetails.getTo(), bookingDetails.getCustomerId(), bookingDetails.getVehicleTypeId(),
				bookingDetails.getSelectedCarId(), bookingDetails.getDriverId(), bookingDetails.getDistance(),
				bookingDetails.getTimeDuration(), bookingDetails.getAmountToPaid(), bookingDetails.getPaymentType(),
				bookingDetails.getStatus());

		BookingDetailsEntity bookingSavedDetails = bookingDetailsRepo.save(bookingDetailsEntity);

		if (bookingSavedDetails != null) {
			DriverDutyEntity driverDetailsById = driverDutyRepo.findByDriverId(bookingDetails.getDriverId());

			driverDetailsById.setStatus("Assigned Booking");

			DriverDutyEntity driverDutySavedDetails = driverDutyRepo.save(driverDetailsById);

			if (driverDutySavedDetails != null) {
				return bookingSavedDetails.getId();
			} else {
				throw new RuntimeException("Something Went Wrong in Driver Duty Assigning");
			}

		} else {
			throw new RuntimeException("Something Went Wrong in Saving Booking Details");
		}
	}

	public List<BookingDetailsDTO> getBookingDetails(String customerId) {

		// System.out.println("Customer Id "+customerId);

		List<BookingDetailsEntity> byBookingId = bookingDetailsRepo.findByCustomerId(customerId);
		// System.out.println("ByBooking id "+byBookingId);
		if (byBookingId.isEmpty()) {

			throw new ResourceNotFoundException("No Booking Found");
		}

		for (BookingDetailsEntity entity : byBookingId) {
			Optional<VehicalDetailsEntity> getCarDetailsById = carDetailsRepository.findById(entity.getSelectedCarId());
			Optional<VehicalTypeEntity> getVehicleDetailsById = vehicleTypeRepository
					.findById(entity.getVehicleTypeId());
			Optional<DriverDetailsEntity> getDriverDetailById = driverDetailsRespository.findById(entity.getDriverId());

			if (getCarDetailsById.isPresent()) {
				VehicalDetailsEntity vehicleEntity = getCarDetailsById.get();
				entity.setVehicleName(vehicleEntity.getName());
			}

			if (getVehicleDetailsById.isPresent()) {
				VehicalTypeEntity carEntity = getVehicleDetailsById.get();
				entity.setCarName(carEntity.getVehicalType());
			}

			if (getDriverDetailById.isPresent()) {
				DriverDetailsEntity driverDetailsEntity = getDriverDetailById.get();
				// System.out.println("driverDetailsEntity.getId()
				// "+driverDetailsEntity.getId());
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
		List<BookingDetailsDTO> dtoList = BookingDetailsMapper.getDTO(byBookingId);
//		System.out.println("Booking Details in service "+ byBookingId);
		return dtoList;
	}

}
