package com.chatapp.dao;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.entities.Room;

@Repository
public interface RoomDao extends MongoRepository<Room, String> {

	Room findByRoomId(String roomId);
}
