package com.org.QuickRide.respositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.org.QuickRide.entities.DiscountEntity;

@Repository
public interface DiscountRespository extends JpaRepository<DiscountEntity, Integer> {

	@Query(value = "select * from discount_coupon_code where coupon_code = :coupon_code ", nativeQuery = true)
	public DiscountEntity getDiscountCodeStatus(@Param("coupon_code") String coupon_code);
}
