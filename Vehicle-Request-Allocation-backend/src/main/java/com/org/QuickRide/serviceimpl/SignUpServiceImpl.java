package com.org.QuickRide.serviceimpl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.org.QuickRide.customexception.CustomExceptionHandler;
import com.org.QuickRide.dto.ForgetPasswordDTO;
import com.org.QuickRide.dto.LoginCredentialDTO;
import com.org.QuickRide.dto.SignUpDTO;
import com.org.QuickRide.dto.UserDetailsDTO;
import com.org.QuickRide.entities.SignUpEntity;
import com.org.QuickRide.helper.PasswordHashService;
import com.org.QuickRide.mapper.SignUpMapper;
import com.org.QuickRide.respositories.SignUpRepository;
import com.org.QuickRide.service.SignUpService;

@Service
public class SignUpServiceImpl implements SignUpService {

	@Autowired
	private SignUpRepository respository;

	@Override
	@CachePut(value = "SignUpCache", key = "#userDetails.email")
	public SignUpDTO getUserSignUp(SignUpDTO userDetails) {
		try {
			SignUpEntity entity = SignUpMapper.getEntity(userDetails);

			String encodePassword = PasswordHashService.getEncodePassword(entity.getPassword());
			entity.setPassword(encodePassword);

			SignUpEntity savedDetails = respository.save(entity);
			SignUpDTO dtoDetails = SignUpMapper.getDTO(savedDetails);
			return dtoDetails;
		} catch (DataIntegrityViolationException e) {
			throw e;
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException("Something Went Wrong");
		}

	}

	@Override
	@Cacheable(value = "SignUpCache", key = "#credential.userName")
	public SignUpDTO getUserLogin(LoginCredentialDTO credential) {

		
	    System.out.println("🟢 Fetching from Database for user");

		Optional<SignUpEntity> userDetails = respository.findByEmail(credential.getUserName());

		if (userDetails.isEmpty()) {
			throw new RuntimeException("Invalid Username and Paasword");
		}

		SignUpEntity entity = userDetails.get();

		if (!entity.getStatus().equals("Active") || entity.getStatus() == null) {
			throw new CustomExceptionHandler(
					"This user ID has been deactivated. For further queries, please contact our Customer Care team. ");
		}

		boolean passwordMatcher = PasswordHashService.passwordMatcher(entity.getPassword(), credential.getPassword());

		// System.out.println("Password Matcher "+passwordMatcher);

		if (passwordMatcher) {

			SignUpDTO dto = SignUpMapper.getDTO(entity);
			return dto;
		} else {
			throw new RuntimeException("Please Enter Correct Password");
		}

	}

	@Override
	public Boolean checkEmailExists(String email) { 
		return respository.existsByEmail(email);
	}

	@Override
	@CacheEvict(value = "SignUpCache", key = "#userDetails.email")
	public void updateUserPassword(ForgetPasswordDTO userDetails) {
		Optional<SignUpEntity> details = respository.findByEmail(userDetails.getEmail());
		
		if (details.isEmpty()) {
			System.out.println("hello world");
			throw new CustomExceptionHandler("Something Went Wrong . Please Try Later");
		}
		SignUpEntity entity = details.get();

		String encodePassword = PasswordHashService.getEncodePassword(userDetails.getNewPassword());
		entity.setPassword(encodePassword);
		
		
		SignUpEntity newSavedeDetails = respository.save(entity);
		
		SignUpDTO signUpDTO = SignUpMapper.getDTO(newSavedeDetails);
		
		
	}
	
	
	@Override
	@CachePut(value = "SignUpCache", key = "#userDetails.email")
	public void updateUserDetails(UserDetailsDTO userDetails) {
		Optional<SignUpEntity> details = respository.findByEmail(userDetails.getEmail());

		if (details.isEmpty()) {
			throw new CustomExceptionHandler("Something Went Wrong . Please Try Later");
		}
		SignUpEntity entity = details.get();

//		String encodePassword = PasswordHashService.getEncodePassword(userDetails.getNewPassword());
//		entity.setPassword(encodePassword);
		respository.save(entity);
	}

}
