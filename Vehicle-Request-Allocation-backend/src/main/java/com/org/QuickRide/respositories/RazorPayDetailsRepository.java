package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.RazorPayDetailsEntity;

@Repository
public interface RazorPayDetailsRepository extends JpaRepository<RazorPayDetailsEntity, Integer>{

}
