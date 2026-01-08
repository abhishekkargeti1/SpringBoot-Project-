package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.DriverRatingEntity;

@Repository
public interface DriverRatingRespository extends JpaRepository<DriverRatingEntity, Integer>{
	
	@Query(value="select * from driver_rating where driver_id = :driverid",nativeQuery = true)
	public DriverRatingEntity getDriverRating(@Param("driverid") int driverId);
	
	
}
