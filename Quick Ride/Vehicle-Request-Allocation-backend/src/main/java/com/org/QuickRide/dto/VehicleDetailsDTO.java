package com.org.QuickRide.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class VehicleDetailsDTO {

	private int vehical_type_id;
	private String name;
	private String status;
}
