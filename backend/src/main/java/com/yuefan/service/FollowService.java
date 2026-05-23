package com.yuefan.service;

import com.yuefan.domain.Influencer;
import com.yuefan.domain.UserFollow;
import com.yuefan.repository.InfluencerRepository;
import com.yuefan.repository.UserFollowRepository;
import com.yuefan.web.dto.FollowStateResponse;
import com.yuefan.web.dto.FollowedPersonResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    public static final String DEFAULT_USER_OPENID = "miniapp-user";

    private final UserFollowRepository userFollowRepository;
    private final InfluencerRepository influencerRepository;

    @Transactional(readOnly = true)
    public List<Long> listFollowedInfluencerIds(String userOpenid) {
        return userFollowRepository.findAllByUserOpenidOrderByIdDesc(resolveUser(userOpenid)).stream()
                .map(UserFollow::getInfluencerId)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowedPersonResponse> listFollowing(String userOpenid) {
        List<UserFollow> rows =
                userFollowRepository.findAllByUserOpenidOrderByIdDesc(resolveUser(userOpenid));
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> ids = rows.stream().map(UserFollow::getInfluencerId).toList();
        Map<Long, Influencer> byId = new HashMap<>();
        for (Influencer inf : influencerRepository.findAllByIdIn(ids)) {
            if (inf.isEnabled()) {
                byId.put(inf.getId(), inf);
            }
        }
        List<FollowedPersonResponse> out = new ArrayList<>();
        for (UserFollow row : rows) {
            Influencer inf = byId.get(row.getInfluencerId());
            if (inf != null) {
                out.add(new FollowedPersonResponse(inf.getId(), inf.getDisplayName(), inf.getAvatarUrl()));
            }
        }
        return out;
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(String userOpenid, long influencerId) {
        return userFollowRepository.existsByUserOpenidAndInfluencerId(resolveUser(userOpenid), influencerId);
    }

    @Transactional(readOnly = true)
    public int countFollowers(long influencerId) {
        return (int) userFollowRepository.countByInfluencerId(influencerId);
    }

    @Transactional
    public FollowStateResponse setFollowing(String userOpenid, long influencerId, boolean following) {
        ensureInfluencerExists(influencerId);
        String uid = resolveUser(userOpenid);
        if (following) {
            if (!userFollowRepository.existsByUserOpenidAndInfluencerId(uid, influencerId)) {
                UserFollow row = new UserFollow();
                row.setUserOpenid(uid);
                row.setInfluencerId(influencerId);
                userFollowRepository.save(row);
            }
        } else {
            userFollowRepository.deleteByUserOpenidAndInfluencerId(uid, influencerId);
        }
        return new FollowStateResponse(influencerId, following, countFollowers(influencerId));
    }

    private void ensureInfluencerExists(long influencerId) {
        if (!influencerRepository.existsById(influencerId)) {
            throw new IllegalArgumentException("用户不存在");
        }
    }

    private static String resolveUser(String userOpenid) {
        if (userOpenid == null || userOpenid.isBlank()) {
            return DEFAULT_USER_OPENID;
        }
        return userOpenid.trim();
    }
}
