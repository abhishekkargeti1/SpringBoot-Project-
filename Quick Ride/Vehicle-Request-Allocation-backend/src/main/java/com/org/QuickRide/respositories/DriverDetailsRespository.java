package com.org.QuickRide.respositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.DriverDetailsEntity;
import com.org.QuickRide.entities.SignUpEntity;


@Repository
public interface DriverDetailsRespository extends JpaRepository<DriverDetailsEntity,Integer>{
	
	@Query(value = "SELECT * FROM driver_details WHERE id = :driver_id", nativeQuery = true)
	DriverDetailsEntity getDriverDetails(@Param("driver_id") Long driver_id);

	
	public Optional<DriverDetailsEntity> findByEmail(String email);
	
	

}
