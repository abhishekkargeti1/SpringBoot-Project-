package com.chatapp.entities;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;



@Document(collection="rooms")

public class Room {
	
	@Id
	private String id;
	private String roomId;
	private List<Messages> messages = new ArrayList<>();
	
	public Room() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Room(String id, String roomId, List<Messages> messages) {
		super();
		this.id = id;
		this.roomId = roomId;
		this.messages = messages;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getRoomId() {
		return roomId;
	}

	public void setRoomId(String roomId) {
		this.roomId = roomId;
	}

	public List<Messages> getMessages() {
		return messages;
	}

	public void setMessages(List<Messages> messages) {
		this.messages = messages;
	}

	@Override
	public String toString() {
		return "Room [id=" + id + ", roomId=" + roomId + ", messages=" + messages + "]";
	}
	
	
	
	
}
