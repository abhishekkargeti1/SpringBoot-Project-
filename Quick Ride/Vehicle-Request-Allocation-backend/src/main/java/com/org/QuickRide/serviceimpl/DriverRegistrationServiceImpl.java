package com.org.QuickRide.serviceimpl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.org.QuickRide.dto.CarDetailsDTO;
import com.org.QuickRide.dto.DriverLoginDTO;
import com.org.QuickRide.dto.DriverRegistrationDetailsDTO;
import com.org.QuickRide.entities.CarDetailsEntity;
import com.org.QuickRide.entities.DriverDetailsEntity;
import com.org.QuickRide.entities.DriverDutyEntity;
import com.org.QuickRide.entities.DriverRatingEntity;
import com.org.QuickRide.entities.VehicalTypeEntity;
import com.org.QuickRide.helper.IdGenerator;
import com.org.QuickRide.mapper.CarDetailsMapper;
import com.org.QuickRide.mapper.DriverDetailsMapper;
import com.org.QuickRide.respositories.CarDetailsRespository;
import com.org.QuickRide.respositories.DriverDetailsRespository;
import com.org.QuickRide.respositories.DriverDutyRespository;
import com.org.QuickRide.respositories.DriverRatingRespository;
import com.org.QuickRide.respositories.VehicleDetailsRepository;
import com.org.QuickRide.respositories.VehicleTypeRepository;
import com.org.QuickRide.service.DriverRegistrationService;

@Service
public class DriverRegistrationServiceImpl implements DriverRegistrationService {

	@Autowired
	private DriverDetailsRespository driverDetailsRespository;
	@Autowired
	private CarDetailsRespository carDetailsRespository;
	@Autowired
	private IdGenerator generator;
	@Autowired
	private DriverDutyRespository driverDutyRespository;
	@Autowired
	private DriverRatingRespository driverRatingRespository;

	@Autowired
	private VehicleTypeRepository typeRepository;

	@Override
	public boolean getDriverRegistrated(DriverRegistrationDetailsDTO driverDetails) {
		try {
			int driverId = generator.generateDriverId();

			CarDetailsDTO carDetailsDTO = driverDetails.getCarDetails();

			DriverDetailsEntity driverEntity = DriverDetailsMapper.toEntity(driverDetails);
			driverEntity.setId(driverId);
			DriverDetailsEntity savedDriverDetails = driverDetailsRespository.save(driverEntity);

			CarDetailsEntity carDetailsEntity = CarDetailsMapper.toEntity(carDetailsDTO);
			carDetailsEntity.setDriverId(driverId);
			carDetailsRespository.save(carDetailsEntity);

			DriverDutyEntity driverDutyEntity = new DriverDutyEntity();

			driverDutyEntity.setDriverId(driverId);
			driverDutyEntity.setStatus("Available");
			driverDutyRespository.save(driverDutyEntity);

			DriverRatingEntity driverRatingEntity = new DriverRatingEntity();
			driverRatingEntity.setDriverId(driverId);
			driverRatingEntity.setRating("1");

			driverRatingRespository.save(driverRatingEntity);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Something Went In Driver Registration");
		}
	}

	@Override
	public DriverRegistrationDetailsDTO getDriverLogin(DriverLoginDTO driverLoginDetails) {
		Optional<DriverDetailsEntity> driverDetails = driverDetailsRespository
				.findByEmail(driverLoginDetails.getUserName());

		if (driverDetails.isPresent()) {

			DriverDetailsEntity driverDetailsEntity = driverDetails.get();

			CarDetailsEntity driverCarDetails = carDetailsRespository
					.getDriverCarDetailsByDriverId(driverDetailsEntity.getId());

			DriverDutyEntity driverDutyStatus = driverDutyRespository.findByDriverId(driverDetailsEntity.getId());

			DriverRatingEntity driverRating = driverRatingRespository.getDriverRating(driverDetailsEntity.getId());

			driverDetailsEntity.setCarDetails(driverCarDetails);
			driverDetailsEntity.setDriverDutyStatus(driverDutyStatus.getStatus());
			driverDetailsEntity.setDriverRating(driverRating.getRating());

			Optional<VehicalTypeEntity> vehicleType = typeRepository.findById(driverDetailsEntity.getVehicalType());
			if (vehicleType.isPresent()) {
				VehicalTypeEntity vehicalTypeEntity = vehicleType.get();
				driverDetailsEntity.setVehicleTypeName(vehicalTypeEntity.getVehicalType());
			} else {
				throw new RuntimeException("Something Went Wrong in Find Vehicle Type");
			}
			System.out.println("Driver Details " + driverDetailsEntity);
			DriverRegistrationDetailsDTO driverDetailsDTO = DriverDetailsMapper
					.getDriverDetailsDTO(driverDetailsEntity);
			return driverDetailsDTO;
		} else {
			throw new RuntimeException("Please Enter Valid Email And Password");
		}
	}
}
