package com.org.QuickRide.entities;

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
@Table(name="discount_coupon_code")
public class DiscountEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name="coupon_code_id")
	private int id;
	@Column(name="coupon_code")
	private String couponCode;
	@Column(name="status")
	private String status;
	
}
