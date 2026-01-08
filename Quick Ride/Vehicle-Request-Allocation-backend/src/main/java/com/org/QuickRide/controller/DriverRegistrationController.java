package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.org.QuickRide.dto.DriverLoginDTO;
import com.org.QuickRide.dto.DriverRegistrationDetailsDTO;
import com.org.QuickRide.helper.EmailService;
import com.org.QuickRide.helper.FileUploadService;
import com.org.QuickRide.serviceimpl.DriverRegistrationServiceImpl;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class DriverRegistrationController {

	@Autowired
	private DriverRegistrationServiceImpl driverRegistrationServiceImpl;
	@Autowired
	private FileUploadService fileUploadService;
	boolean status = false;
	private EmailService email = new EmailService();

	@PostMapping(value = "/driverRegistration")
	public ResponseEntity<?> getDriverRegistration(@ModelAttribute DriverRegistrationDetailsDTO detailsDTO) {
		Map<String, Object> response = new HashMap<>();

		if (detailsDTO.getAadhaarCard().isEmpty() || detailsDTO.getPoliceVerificationCertificate().isEmpty()
				|| detailsDTO.getCarDetails().getCarRegistrationNumber().isEmpty()) {

			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File Not Found");

		} else if (!fileUploadService.isPDF(detailsDTO.getAadhaarCard())
				|| !fileUploadService.isPDF(detailsDTO.getPoliceVerificationCertificate())
				|| !fileUploadService.isPDF(detailsDTO.getCarDetails().getRegistrationCard())) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only PDF is allowed");
		} else {
			String aadharCardFileName = detailsDTO.getAadhaarCard().getOriginalFilename();
			String policeVerificationFileName = detailsDTO.getPoliceVerificationCertificate().getOriginalFilename();

			String carRegistrationFileName = detailsDTO.getCarDetails().getRegistrationCard().getOriginalFilename();

			detailsDTO.setAadhaarCardFileName(aadharCardFileName);
			detailsDTO.setPoliceVerificationFileName(policeVerificationFileName);

			detailsDTO.getCarDetails().setRegistrationCardFileName(carRegistrationFileName);

			System.out.println("Details are " + detailsDTO);

			boolean driverRegistrated = driverRegistrationServiceImpl.getDriverRegistrated(detailsDTO);

			MultipartFile files[] = new MultipartFile[3];
			files[0] = detailsDTO.getAadhaarCard();
			files[1] = detailsDTO.getPoliceVerificationCertificate();
			files[2] = detailsDTO.getCarDetails().getRegistrationCard();

			if (driverRegistrated) {

				for (int i = 0; i < files.length; i++) {
					status = fileUploadService.uploadFile(files[i]);
				}

				if (status) {
					
					
					String subject = "Welcome to QUICK Ride – Registration Successful";

					
					String message =
					        "Dear Driver,\n\n"
					      + "Welcome to QUICK Ride!\n\n"
					      + "We’re excited to inform you that your registration on the QUICK Ride platform has been successfully completed.\n\n"
					      + "You are now part of our growing network of trusted drivers. QUICK Ride is committed to providing a seamless, reliable, and secure ride experience for both drivers and customers.\n\n"
					      + "Your User Id is: " + detailsDTO.getEmail() + "\n"
					      + "Password is: d4ng3r\n\n"
					      + "Important Note:\n"
					      + "Please ensure that all the information and documents you provided are accurate and up to date. Any discrepancy may delay account activation.\n\n"
					      + "If you have any questions or require assistance, feel free to contact our support team.\n\n"
					      + "Thank you for choosing QUICK Ride. We look forward to working with you and wish you a safe and successful journey ahead.\n\n"
					      + "Warm regards,\n"
					      + "Team QUICK Ride\n"
					      + "Support Team";

					
					
					
					email.mailSender(message, subject, detailsDTO.getEmail());
					
					
					
					
					
					response.put("status", status);
					return ResponseEntity.status(HttpStatus.OK).body(response);

				} else {
					response.put("status", status);
					return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

				}
			}

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

		}
	}
	
	@PostMapping("/driverLogin")
	public ResponseEntity<?> getDriverLogin(@RequestBody DriverLoginDTO driverLoginDTO){
		Map<String, Object> response = new HashMap<>();
		
		
		System.out.println("Driver Login Credential "+driverLoginDTO);
		
		DriverRegistrationDetailsDTO driverLogin = driverRegistrationServiceImpl.getDriverLogin(driverLoginDTO);
		
		response.put("Driver Details", driverLogin);
		
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		
	}
	
	
	
	
	
}
