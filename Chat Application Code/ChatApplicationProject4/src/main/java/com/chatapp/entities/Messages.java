package com.chatapp.entities;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


public class Messages {
	private String sender;
	private String content;
	private LocalDateTime timeStamp;
	
	public Messages() {
		super();
		// TODO Auto-generated constructor stub
	}

	public Messages(String sender, String content) {
		super();
		this.sender = sender;
		this.content = content;
		this.timeStamp = LocalDateTime.now();
	}

	public String getSender() {
		return sender;
	}

	public void setSender(String sender) {
		this.sender = sender;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public LocalDateTime getTimeStamp() {
		return timeStamp;
	}

	public void setTimeStamp(LocalDateTime timeStamp) {
		this.timeStamp = timeStamp;
	}

	@Override
	public String toString() {
		return "Messages [sender=" + sender + ", content=" + content + ", timeStamp=" + timeStamp + "]";
	}
	
	
	
	
}
