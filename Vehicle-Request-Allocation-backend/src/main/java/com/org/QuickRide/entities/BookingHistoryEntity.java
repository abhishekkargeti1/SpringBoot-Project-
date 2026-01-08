package com.org.QuickRide.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Table(name="booking_details_history")
public class BookingHistoryEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="booking_id")
	private int id;
	@Column(name="source")
	private String from;
	@Column(name="destination")
	private String to;
	@Column(name="customer_id")
	private int customerId;
	@Column(name="vehicle_type")
	private int vehicleTypeId;
	@Column(name="car_details")
	private int selectedCarId;
	@Column(name="driver_id")
	private int driverId;
	@Column(name="trip_distance")
	private String distance;
	@Column(name="time_duration")
	private String timeDuration;
	@Column(name="amount_to_paid")
	private String amountToPaid;
	@Column(name="payment_type")
	private String paymentType;
	@Column(name="status")
	private String status;
	@Column(name="trip_status")
	private String tripStatus;
	@Column(name="rating")
	private String rating;
	
	

	@Transient
	private String vehicleName;
	@Transient
	private String carName;
	@Transient
	private DriverDetailsEntity driverDetails;
	
	
	
	
	
	
	
	
	

}
