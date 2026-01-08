package com.org.QuickRide.respositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.FindDriverEntity;

@Repository
public interface FindDriver extends JpaRepository<FindDriverEntity, Integer>{

	@Query(value = "SELECT\r\n"
			+ "    d.id       AS driver_id,\r\n"
			+ "    dds.status AS duty_status,\r\n"
			+ "    dr.rating  AS rating\r\n"
			+ "FROM driver_details d\r\n"
			+ "LEFT JOIN driver_duty_status dds\r\n"
			+ "    ON dds.driver_id = d.id\r\n"
			+ "LEFT JOIN driver_rating dr\r\n"
			+ "    ON dr.driver_id = d.id\r\n"
			+ "WHERE d.car_details = :cartype and dr.rating is not null"  , nativeQuery = true)
	public List<FindDriverEntity> getDriver(@Param("cartype") String carType);
	
}
