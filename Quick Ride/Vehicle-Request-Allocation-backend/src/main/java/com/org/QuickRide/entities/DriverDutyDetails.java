package com.org.QuickRide.entities;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name="driver_duty_details")
public class DriverDutyDetails {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private int id;
	@Column(name="customer_id")
	private int customerId;
	@Column(name="driver_id")
	private int driverId;
	@Column(name="trip_amount")
	private String tripAmount;
	@Column(name="payment_type")
	private String paymentType;
	@Column(name="payment_status")
	private String paymentStatus;
	@Column(name="pick_up_point")
	private String pickUpPoint;
	@Column(name="destination_point")
	private String destinationPoint;
	@Column(name="trip_distance")
	private String tripDistance;
	@Column(name="trip_status")
	private String tripStatus = "Not Started Yet";

}
