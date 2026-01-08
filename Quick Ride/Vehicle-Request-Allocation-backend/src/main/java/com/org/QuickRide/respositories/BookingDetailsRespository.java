package com.org.QuickRide.respositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.BookingDetailsEntity;

@Repository
public interface BookingDetailsRespository extends JpaRepository<BookingDetailsEntity, Integer> {

	
	@Query(value="select * from booking_details where customer_id = :customerId and (trip_status <> 'completed' OR trip_status IS NULL) " , nativeQuery = true)
		public List<BookingDetailsEntity> findByCustomerId(@Param("customerId") String customerId);
	
	
	
}
