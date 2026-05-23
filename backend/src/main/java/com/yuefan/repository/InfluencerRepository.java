package com.yuefan.repository;

import com.yuefan.domain.Influencer;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InfluencerRepository extends JpaRepository<Influencer, Long> {

    Page<Influencer> findAllByOrderBySortOrderDescIdDesc(Pageable pageable);

    List<Influencer> findAllByEnabledTrueOrderBySortOrderAscIdAsc();

    List<Influencer> findAllByIdIn(Collection<Long> ids);
}
