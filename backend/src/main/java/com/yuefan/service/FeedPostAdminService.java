package com.yuefan.service;

import com.yuefan.domain.FeedPost;
import com.yuefan.domain.Influencer;
import com.yuefan.repository.FeedPostRepository;
import com.yuefan.repository.InfluencerRepository;
import com.yuefan.web.dto.FeedPostResponse;
import com.yuefan.web.dto.FeedPostWriteRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedPostAdminService {

    private static final String VISIBLE = "VISIBLE";

    private final FeedPostRepository feedPostRepository;
    private final InfluencerRepository influencerRepository;
    private final FeedPostInteractionService feedPostInteractionService;

    @Transactional(readOnly = true)
    public Page<FeedPostResponse> list(Pageable pageable) {
        return feedPostRepository.findAllByOrderBySortOrderDescIdDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public FeedPostResponse get(long id) {
        return toResponse(load(id));
    }

    @Transactional
    public FeedPostResponse create(FeedPostWriteRequest req) {
        FeedPost e = fromRequest(new FeedPost(), req);
        return toResponse(feedPostRepository.save(e));
    }

    @Transactional
    public FeedPostResponse update(long id, FeedPostWriteRequest req) {
        FeedPost e = load(id);
        fromRequest(e, req);
        return toResponse(feedPostRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!feedPostRepository.existsById(id)) {
            throw new IllegalArgumentException("动态不存在");
        }
        feedPostInteractionService.deleteAllForPost(id);
        feedPostRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<FeedPostResponse> listVisible(String userOpenid) {
        Map<String, Long> influencerByAuthor = buildInfluencerNameIndex();
        return feedPostRepository.findAllByStatusOrderBySortOrderDescIdDesc(VISIBLE).stream()
                .map(e -> toResponse(e, influencerByAuthor, userOpenid))
                .toList();
    }

    @Transactional(readOnly = true)
    public FeedPostResponse getVisible(long id, String userOpenid) {
        FeedPost e =
                feedPostRepository
                        .findByIdAndStatus(id, VISIBLE)
                        .orElseThrow(() -> new IllegalArgumentException("动态不存在"));
        return toResponse(e, buildInfluencerNameIndex(), userOpenid);
    }

    private FeedPost load(long id) {
        return feedPostRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("动态不存在"));
    }

    private FeedPost fromRequest(FeedPost e, FeedPostWriteRequest req) {
        e.setAuthorName(req.authorName().trim());
        e.setAuthorAvatarUrl(req.authorAvatarUrl().trim());
        e.setTimeText(req.timeText() != null ? req.timeText().trim() : "");
        e.setContent(req.content().trim());
        e.setImageUrl(req.imageUrl() != null ? req.imageUrl().trim() : "");
        e.setLocationLabel(req.locationLabel() != null ? req.locationLabel().trim() : "");
        e.setGatherBadge(req.gatherBadge() != null ? req.gatherBadge().trim() : "");
        e.setLikesCount(req.likesCount());
        e.setCommentsCount(req.commentsCount());
        e.setSharesCount(req.sharesCount());
        e.setStatus(req.status().trim().toUpperCase());
        e.setSortOrder(req.sortOrder());
        return e;
    }

    private FeedPostResponse toResponse(FeedPost e) {
        return toResponse(e, buildInfluencerNameIndex(), null);
    }

    private FeedPostResponse toResponse(FeedPost e, Map<String, Long> influencerByAuthor) {
        return toResponse(e, influencerByAuthor, null);
    }

    private FeedPostResponse toResponse(FeedPost e, Map<String, Long> influencerByAuthor, String userOpenid) {
        Boolean likedByMe = null;
        if (userOpenid != null && !userOpenid.isBlank()) {
            likedByMe = feedPostInteractionService.isLiked(e.getId(), userOpenid);
        }
        return new FeedPostResponse(
                e.getId(),
                e.getAuthorName(),
                e.getAuthorAvatarUrl(),
                e.getTimeText(),
                e.getContent(),
                e.getImageUrl(),
                e.getLocationLabel(),
                e.getGatherBadge(),
                e.getLikesCount(),
                e.getCommentsCount(),
                e.getSharesCount(),
                e.getStatus(),
                e.getSortOrder(),
                resolveAuthorInfluencerId(e.getAuthorName(), influencerByAuthor),
                likedByMe);
    }

    private Map<String, Long> buildInfluencerNameIndex() {
        Map<String, Long> map = new HashMap<>();
        for (Influencer inf : influencerRepository.findAll()) {
            if (!inf.isEnabled() || inf.getDisplayName() == null) {
                continue;
            }
            map.putIfAbsent(inf.getDisplayName().trim(), inf.getId());
        }
        return map;
    }

    private static Long resolveAuthorInfluencerId(String authorName, Map<String, Long> influencerByAuthor) {
        if (authorName == null || authorName.isBlank() || influencerByAuthor.isEmpty()) {
            return null;
        }
        String name = authorName.trim();
        Long exact = influencerByAuthor.get(name);
        if (exact != null) {
            return exact;
        }
        for (Map.Entry<String, Long> entry : influencerByAuthor.entrySet()) {
            String dn = entry.getKey();
            if (name.contains(dn) || dn.contains(name)) {
                return entry.getValue();
            }
        }
        return null;
    }
}
