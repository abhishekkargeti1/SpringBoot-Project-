package com.org.QuickRide.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.org.QuickRide.dto.ForgetPasswordDTO;
import com.org.QuickRide.dto.LoginCredentialDTO;
import com.org.QuickRide.dto.SignUpDTO;
import com.org.QuickRide.helper.EmailService;
import com.org.QuickRide.helper.OTPGenerater;
import com.org.QuickRide.security.JwtFilter;
import com.org.QuickRide.serviceimpl.SignUpServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class SignUpController {

	@Autowired
	private SignUpServiceImpl signUpService;

	EmailService email = new EmailService();

	private String otpCode;

	@Autowired
	JwtFilter filter;

	@PostMapping("/signup")
	public ResponseEntity<?> getUserDetails(@Valid @RequestBody SignUpDTO dto, BindingResult error) {
		System.out.println("dto "+dto);
		if (error.hasErrors()) {
			for (FieldError e : error.getFieldErrors()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getDefaultMessage()));
			}
		}

		SignUpDTO userSignUp = signUpService.getUserSignUp(dto);
		String subject = "Welcome to QuickRide – Your Account Has Been Successfully Registered!";

		String userName = "";

		if (dto.getFirstName() != null) {
			userName += dto.getFirstName() + " ";
		}
		if (dto.getMiddleName() != null) {
			userName += dto.getMiddleName() + " ";
		}
		if (dto.getLastName() != null) {
			userName += dto.getLastName();
		}

		// System.out.println("User Name is "+userName);

		String emailBody = "Dear " + userName + ",\n\n" + "Welcome to QuickRide! 🎊\n\n"
				+ "We’re excited to have you onboard. Your registration has been successfully completed, "
				+ "and your account is now active. You can start exploring QuickRide to book rides, share trips, "
				+ "and make your daily commute smarter and more affordable.\n\n"
				+ "Here are a few things you can do next:\n\n"
				+ "🚗 Book your first ride instantly from the dashboard.\n\n"
				+ "🤝 Share a ride with others to save on travel costs.\n\n"
				+ "📍 Track your rides and manage bookings easily in your account.\n\n"
				+ "If you have any questions or need help getting started, feel free to reach out to our support team "
				+ "at support@quickride.com — we’re always happy to assist.\n\n" + "Once again, welcome aboard!\n"
				+ "Let’s make every ride quicker, smarter, and greener. 🌱\n\n" + "Best regards,\n"
				+ "The QuickRide Team\n" + "www.quickride.com";

		if (userSignUp != null) {
			//System.out.println("Hello Email");
			email.mailSender(emailBody, subject, dto.getEmail());
		}
		return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User Successfully Registered "));

	}

	@PostMapping("/userLogin")
	public ResponseEntity<?> getUserLogin(@Valid @RequestBody LoginCredentialDTO credential, BindingResult error) {

		if (error.hasErrors()) {
			for (FieldError e : error.getFieldErrors()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getDefaultMessage()));
			}
		}

		SignUpDTO userDetails = signUpService.getUserLogin(credential);
		Map<String, Object> response = new HashMap<>();
		if (userDetails != null) {
			String token = filter.generateToken(userDetails.getEmail());
			//System.out.println("Token is "+token);
			response.put("token", token);
			response.put("userDetails", userDetails);
		}
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	@PostMapping("/send-otp")
	public ResponseEntity<?> sendOTP(@RequestBody ForgetPasswordDTO forgetPasswordDTO) {

		if (forgetPasswordDTO.getEmail() == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Please Enter Vaild Email"));
		}
		boolean checkEmailExists = signUpService.checkEmailExists(forgetPasswordDTO.getEmail());

		if (checkEmailExists) {

			String subject = "Email verification from QuickRide";
			otpCode = OTPGenerater.otp();
			String message = "Dear QuickRide User ,\n\n"
					+ "We received a request to reset your password for your QuickRide account.\n\n"
					+ "Your One-Time Password (OTP) for verification is: " + otpCode + "\n\n"
					+ "Please use this OTP within the next 10 minutes to complete your password reset process.\n\n"
					+ "If you did not request this, please ignore this email — your account is safe.\n\n"
					+ "Best Regards,\n" + "The QuickRide Support Team\n" + "support@quickride.com\n"
					+ "www.quickride.com";
			email.mailSender(message, subject, forgetPasswordDTO.getEmail());
		}
		Map<String, Object> response = new HashMap<>();
		response.put("message", "Email Send Successfully");
		response.put("otpValue", otpCode);
		return ResponseEntity.status(HttpStatus.OK).body(response);
	}

	@PatchMapping("/update-password")
	public ResponseEntity<?> updateUserPassword(@RequestBody ForgetPasswordDTO forgetPasswordDTO) {
		if (forgetPasswordDTO.getEmail() == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Please Enter Vaild Email"));
		}

		if (forgetPasswordDTO.getNewPassword() == null) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Please Enter Password"));
		}
		// System.out.println("Hello World");
		signUpService.updateUserPassword(forgetPasswordDTO);
		return ResponseEntity.status(HttpStatus.OK).body(Map.of("message", "Password Successfully Updated"));
	}

}
