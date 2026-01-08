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
@Table(name = "driver_details")
public class DriverDetailsEntity {

	@Id
	private int id;
	@Column(name = "first_name")
	private String firstName;
	@Column(name = "middle_name")
	private String middleName;
	@Column(name = "last_name")
	private String lastName;
	@Column(name = "contact_number")
	private String contactNumber;
	private String email;
	@Column(name = "aadhaar_card_number")
	private String aadhaarCardNumber;
	@Column(name = "police_verification_expiry")
	private String policeVerificationExpiry;
	@Column(name = "police_verification_file_name")
	private String policeVerificationFileName;
	@Column(name = "aadhaar_card_file_name")
	private String aadhaarCardFileName;
	@Column(name = "car_details")
	private int vehicalType;
	@Transient
	private String driverRating;
	@Transient
	private CarDetailsEntity carDetails;
	@Transient
	private String driverDutyStatus;
	@Transient
	private String vehicleTypeName;
}
