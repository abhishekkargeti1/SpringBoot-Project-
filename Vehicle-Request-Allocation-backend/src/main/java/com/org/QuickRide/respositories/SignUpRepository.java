package com.org.QuickRide.respositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.SignUpEntity;

@Repository
public interface SignUpRepository extends JpaRepository<SignUpEntity, Integer> {

	
	public Optional<SignUpEntity> findByEmail(String email);
	public boolean existsByEmail(String email);
	
}
