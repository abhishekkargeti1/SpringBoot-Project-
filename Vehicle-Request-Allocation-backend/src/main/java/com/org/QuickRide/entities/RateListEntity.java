package com.org.QuickRide.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
public class RateListEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="rate_list_id")
	private int rateListId;
	@Column(name="rate_per_km")
	private int ratePerKm;
}
