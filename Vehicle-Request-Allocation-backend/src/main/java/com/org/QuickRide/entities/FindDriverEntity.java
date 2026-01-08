package com.org.QuickRide.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
public class FindDriverEntity {

	@Id
	@Column(name="driver_id")
	private Long id;
    @Column(name="duty_status")
	private String onDuty;
    @Column(name="rating")
    private double rating;
}
