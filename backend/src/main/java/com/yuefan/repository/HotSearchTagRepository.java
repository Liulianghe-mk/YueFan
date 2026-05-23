package com.yuefan.repository;

import com.yuefan.domain.HotSearchTag;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotSearchTagRepository extends JpaRepository<HotSearchTag, Long> {

    Page<HotSearchTag> findAllByOrderBySortOrderAscIdAsc(Pageable pageable);

    List<HotSearchTag> findAllByEnabledTrueOrderBySortOrderAscIdAsc();
}
