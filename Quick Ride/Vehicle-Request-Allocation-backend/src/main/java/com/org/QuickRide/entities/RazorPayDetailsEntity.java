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
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Table(name="razor_pay_details")
public class RazorPayDetailsEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private int id;
	@Column(name="payment_id")
	private String razorpayPaymentId;
	@Column(name="order_id")
	private String razorpayOrderId;
	@Column(name="signature")
	private String razorpaySignature;
	@Column(name="customer_id")
	private int customerId;
}
