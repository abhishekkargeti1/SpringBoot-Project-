package com.org.QuickRide.respositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.BookingHistoryEntity;

@Repository
public interface BookingHistoryRespository extends JpaRepository<BookingHistoryEntity, Integer> {

	
	@Query(value="select * from booking_details_history where customer_id = :customerId ", nativeQuery = true)
	List<BookingHistoryEntity> getBookingHistory(@Param("customerId") String customerId ); 
	
}
