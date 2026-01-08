package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.CarDetailsEntity;

@Repository
public interface CarDetailsRespository extends JpaRepository<CarDetailsEntity, Integer> {
	
	@Query(value="select * from driver_car_details where driver_id = :driverId ",nativeQuery = true)
	public CarDetailsEntity getDriverCarDetailsByDriverId(@Param("driverId") int driverId);

}
