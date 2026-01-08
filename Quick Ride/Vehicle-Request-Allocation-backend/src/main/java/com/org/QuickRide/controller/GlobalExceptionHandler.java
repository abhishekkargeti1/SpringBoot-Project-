package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.org.QuickRide.customexception.CustomExceptionHandler;
import com.org.QuickRide.customexception.ResourceNotFoundException;


@RestControllerAdvice
public class GlobalExceptionHandler {


		//Custom Exception
		@ExceptionHandler(CustomExceptionHandler.class)
	    public ResponseEntity<Map<String, Object>> handleUserDeactivated(CustomExceptionHandler ex) {
			
	        Map<String, Object> response = new HashMap<>();
	        response.put("message", ex.getMessage());
	        return  ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
	    }
	
	
	
    // Handle Spring's wrapped version
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Email Already Exists"));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> dataNotFound(ResourceNotFoundException e) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", e.getMessage()));
    }

    
    
    // Generic fallback
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", e.getMessage()));
    }
}
