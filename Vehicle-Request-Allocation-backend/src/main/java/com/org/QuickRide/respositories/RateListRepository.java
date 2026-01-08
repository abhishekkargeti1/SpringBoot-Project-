package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.RateListEntity;

@Repository
public interface RateListRepository extends JpaRepository<RateListEntity, Integer> {
	
	@Query(value = "SELECT rate_per_km,rate_list_id FROM rate_list WHERE vehicle_type_id = :vehicleTypeId ", nativeQuery = true)
	public RateListEntity getRateByVehicleType(@Param("vehicleTypeId") int vehicleTypeId);

}
