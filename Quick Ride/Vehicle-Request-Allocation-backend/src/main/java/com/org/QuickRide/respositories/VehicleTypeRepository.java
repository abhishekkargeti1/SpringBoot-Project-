package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.VehicalTypeEntity;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicalTypeEntity, Integer>{
	
}
