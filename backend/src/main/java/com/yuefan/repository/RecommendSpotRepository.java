package com.yuefan.repository;

import com.yuefan.domain.RecommendSpot;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecommendSpotRepository extends JpaRepository<RecommendSpot, Long> {

    Page<RecommendSpot> findAllByOrderBySortOrderDescIdDesc(Pageable pageable);

    List<RecommendSpot> findAllByStatusOrderBySortOrderDescIdDesc(String status);
}
