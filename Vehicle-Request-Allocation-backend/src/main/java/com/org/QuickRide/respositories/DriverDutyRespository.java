package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.DriverDutyEntity;

@Repository
public interface DriverDutyRespository extends JpaRepository<DriverDutyEntity, Integer>{
	
	public DriverDutyEntity findByDriverId(int driverId);



}
