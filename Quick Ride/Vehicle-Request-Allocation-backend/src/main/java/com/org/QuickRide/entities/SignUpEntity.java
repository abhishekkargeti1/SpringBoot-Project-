package com.org.QuickRide.entities;

import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

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
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Table(name="quick_ride_user_data")
@RedisHash(value = "SignUpDetails") 
public class SignUpEntity {

	@Id
    @Indexed
	@GeneratedValue(strategy = GenerationType.AUTO)
	private int id;
	
	@Column(name="First_Name")
	private String firstName;
	@Column(name="Middle_Name")
	private String middleName;
	@Column(name="Last_Name")
	private String lastName;
	@Column(name="contact_number")
	private String contactNumber;
	@Column(name="email")
	private String email;
	@Column(name="password")
	private String password;
	@Column(name = "status", nullable = false)
	private String status = "Active";
	
}
