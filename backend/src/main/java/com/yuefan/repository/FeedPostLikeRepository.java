package com.yuefan.repository;

import com.yuefan.domain.FeedPostLike;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedPostLikeRepository extends JpaRepository<FeedPostLike, Long> {

    boolean existsByPostIdAndUserOpenid(long postId, String userOpenid);

    Optional<FeedPostLike> findByPostIdAndUserOpenid(long postId, String userOpenid);

    long countByPostId(long postId);

    void deleteByPostIdAndUserOpenid(long postId, String userOpenid);

    void deleteAllByPostId(long postId);

    @Query(
            value =
                    "SELECT l FROM FeedPostLike l WHERE l.postId = :postId ORDER BY l.createdAt DESC")
    List<FeedPostLike> findRecentByPostId(@Param("postId") long postId);
}
