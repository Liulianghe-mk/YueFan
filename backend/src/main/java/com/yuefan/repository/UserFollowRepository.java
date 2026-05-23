package com.yuefan.repository;

import com.yuefan.domain.UserFollow;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    boolean existsByUserOpenidAndInfluencerId(String userOpenid, long influencerId);

    Optional<UserFollow> findByUserOpenidAndInfluencerId(String userOpenid, long influencerId);

    void deleteByUserOpenidAndInfluencerId(String userOpenid, long influencerId);

    List<UserFollow> findAllByUserOpenidOrderByIdDesc(String userOpenid);

    long countByInfluencerId(long influencerId);

    long countByUserOpenid(String userOpenid);
}
