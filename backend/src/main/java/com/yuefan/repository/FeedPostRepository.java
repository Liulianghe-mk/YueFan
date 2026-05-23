package com.yuefan.repository;

import com.yuefan.domain.FeedPost;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {

    Page<FeedPost> findAllByOrderBySortOrderDescIdDesc(Pageable pageable);

    List<FeedPost> findAllByStatusOrderBySortOrderDescIdDesc(String status);

    Optional<FeedPost> findByIdAndStatus(long id, String status);
}
