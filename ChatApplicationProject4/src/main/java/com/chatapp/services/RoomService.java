package com.chatapp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chatapp.dao.RoomDao;
import com.chatapp.entities.Room;

@Service
public class RoomService {
	@Autowired
	RoomDao dao;
	
	public Room getRoomById(String roomId) {
		return dao.findByRoomId(roomId);
	}
	
	public Room createNewRoom(Room room) {
		return dao.save(room);
	}

}
