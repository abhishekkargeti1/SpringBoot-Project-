package com.org.QuickRide.service;

import java.util.List;

import com.org.QuickRide.dto.BookingHistoryDTO;

public interface BookingHistoryService {

	
	public List<BookingHistoryDTO> getBookingHistory(String userId);
}
