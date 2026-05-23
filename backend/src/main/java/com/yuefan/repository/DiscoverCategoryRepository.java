package com.yuefan.repository;

import com.yuefan.domain.DiscoverCategory;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscoverCategoryRepository extends JpaRepository<DiscoverCategory, Long> {

    Page<DiscoverCategory> findAllByOrderBySortOrderAscIdAsc(Pageable pageable);

    List<DiscoverCategory> findAllByEnabledTrueOrderBySortOrderAscIdAsc();
}
