package com.org.QuickRide.respositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.VehicalDetailsEntity;


@Repository
public interface VehicleDetailsRepository extends JpaRepository<VehicalDetailsEntity, Integer> {
	
	
	@Query(value = "SELECT * FROM vehical_details WHERE vehical_type = :vehical_type_id AND status = 'A'",
		    nativeQuery = true)
		List<VehicalDetailsEntity> getDetails(@Param("vehical_type_id") int vehical_type_id);

	
	
		

}
