package com.yuefan.service;

import com.yuefan.domain.AppUser;
import com.yuefan.domain.FeedPost;
import com.yuefan.domain.FeedPostComment;
import com.yuefan.domain.FeedPostLike;
import com.yuefan.repository.FeedPostCommentRepository;
import com.yuefan.repository.FeedPostLikeRepository;
import com.yuefan.repository.FeedPostRepository;
import com.yuefan.web.dto.FeedCommentCreateRequest;
import com.yuefan.web.dto.FeedCommentResponse;
import com.yuefan.web.dto.FeedLikeResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedPostInteractionService {

    public static final String DEFAULT_USER_OPENID = "miniapp-user";
    private static final String VISIBLE = "VISIBLE";

    private final FeedPostRepository feedPostRepository;
    private final FeedPostLikeRepository feedPostLikeRepository;
    private final FeedPostCommentRepository feedPostCommentRepository;
    private final AppUserService appUserService;

    @Transactional
    public FeedLikeResponse like(long postId, String userOpenid) {
        FeedPost post = loadVisiblePost(postId);
        String uid = resolveUser(userOpenid);
        if (feedPostLikeRepository.existsByPostIdAndUserOpenid(postId, uid)) {
            return new FeedLikeResponse(post.getLikesCount(), true);
        }
        FeedPostLike row = new FeedPostLike();
        row.setPostId(postId);
        row.setUserOpenid(uid);
        feedPostLikeRepository.save(row);
        syncLikesCount(post);
        return new FeedLikeResponse(post.getLikesCount(), true);
    }

    @Transactional
    public FeedLikeResponse unlike(long postId, String userOpenid) {
        FeedPost post = loadVisiblePost(postId);
        String uid = resolveUser(userOpenid);
        feedPostLikeRepository.deleteByPostIdAndUserOpenid(postId, uid);
        syncLikesCount(post);
        return new FeedLikeResponse(post.getLikesCount(), false);
    }

    @Transactional(readOnly = true)
    public boolean isLiked(long postId, String userOpenid) {
        if (userOpenid == null || userOpenid.isBlank()) {
            return false;
        }
        return feedPostLikeRepository.existsByPostIdAndUserOpenid(postId, resolveUser(userOpenid));
    }

    @Transactional(readOnly = true)
    public List<FeedCommentResponse> listComments(long postId) {
        loadVisiblePost(postId);
        List<FeedPostComment> rows = feedPostCommentRepository.findAllByPostIdOrderByCreatedAtAsc(postId);
        return buildCommentTree(rows);
    }

    @Transactional(readOnly = true)
    public List<FeedCommentResponse> listCommentsForAdmin(long postId) {
        if (!feedPostRepository.existsById(postId)) {
            throw new IllegalArgumentException("动态不存在");
        }
        List<FeedPostComment> rows = feedPostCommentRepository.findAllByPostIdOrderByCreatedAtAsc(postId);
        return buildCommentTree(rows);
    }

    @Transactional
    public FeedCommentResponse addComment(long postId, String userOpenid, FeedCommentCreateRequest req) {
        FeedPost post = loadVisiblePost(postId);
        String uid = resolveUser(userOpenid);
        AppUser profile = appUserService.ensureUser(uid);
        String content = req.content().trim();
        if (content.isEmpty()) {
            throw new IllegalArgumentException("评论内容不能为空");
        }

        Long parentId = req.parentId();
        String replyToNickname = "";
        if (parentId != null) {
            FeedPostComment parent =
                    feedPostCommentRepository
                            .findById(parentId)
                            .orElseThrow(() -> new IllegalArgumentException("被回复的评论不存在"));
            if (parent.getPostId() != postId) {
                throw new IllegalArgumentException("评论不属于该动态");
            }
            Long rootId = parent.getParentId() != null ? parent.getParentId() : parent.getId();
            parentId = rootId;
            replyToNickname = parent.getNickname() != null ? parent.getNickname().trim() : "";
        }

        FeedPostComment row = new FeedPostComment();
        row.setPostId(postId);
        row.setUserOpenid(uid);
        row.setNickname(profile.getNickname());
        row.setAvatarUrl(profile.getAvatarUrl() != null ? profile.getAvatarUrl() : "");
        row.setContent(content.length() <= 1000 ? content : content.substring(0, 1000));
        row.setParentId(parentId);
        row.setReplyToNickname(replyToNickname);
        FeedPostComment saved = feedPostCommentRepository.save(row);
        syncCommentsCount(post);
        return toCommentResponse(saved, List.of());
    }

    @Transactional
    public void deleteComment(long postId, long commentId) {
        FeedPost post =
                feedPostRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("动态不存在"));
        FeedPostComment target =
                feedPostCommentRepository
                        .findById(commentId)
                        .orElseThrow(() -> new IllegalArgumentException("评论不存在"));
        if (target.getPostId() != postId) {
            throw new IllegalArgumentException("评论不属于该动态");
        }
        if (target.getParentId() == null) {
            feedPostCommentRepository.deleteAllByParentId(commentId);
        }
        feedPostCommentRepository.delete(target);
        syncCommentsCount(post);
    }

    @Transactional
    public void deleteAllForPost(long postId) {
        feedPostLikeRepository.deleteAllByPostId(postId);
        feedPostCommentRepository.deleteAllByPostId(postId);
    }

    @Transactional(readOnly = true)
    public List<String> recentLikeAvatarUrls(long postId, int limit) {
        List<FeedPostLike> likes = feedPostLikeRepository.findRecentByPostId(postId);
        List<String> avatars = new ArrayList<>();
        for (FeedPostLike like : likes) {
            if (avatars.size() >= limit) {
                break;
            }
            try {
                AppUser u = appUserService.ensureUser(like.getUserOpenid());
                String av = u.getAvatarUrl() != null ? u.getAvatarUrl().trim() : "";
                if (!av.isEmpty()) {
                    avatars.add(av);
                }
            } catch (RuntimeException ignored) {
                // skip invalid user rows
            }
        }
        return avatars;
    }

    private List<FeedCommentResponse> buildCommentTree(List<FeedPostComment> rows) {
        Map<Long, FeedCommentResponse> roots = new LinkedHashMap<>();
        Map<Long, List<FeedPostComment>> repliesByParent = new HashMap<>();
        for (FeedPostComment row : rows) {
            if (row.getParentId() == null) {
                roots.put(row.getId(), toCommentResponse(row, new ArrayList<>()));
            } else {
                repliesByParent.computeIfAbsent(row.getParentId(), k -> new ArrayList<>()).add(row);
            }
        }
        List<FeedCommentResponse> result = new ArrayList<>();
        for (Map.Entry<Long, FeedCommentResponse> entry : roots.entrySet()) {
            long rootId = entry.getKey();
            List<FeedPostComment> replyRows = repliesByParent.getOrDefault(rootId, List.of());
            List<FeedCommentResponse> replies =
                    replyRows.stream().map(r -> toCommentResponse(r, List.of())).toList();
            FeedCommentResponse root = entry.getValue();
            result.add(
                    new FeedCommentResponse(
                            root.id(),
                            root.postId(),
                            root.userOpenid(),
                            root.authorName(),
                            root.authorAvatarUrl(),
                            root.timeText(),
                            root.content(),
                            root.parentId(),
                            root.replyToNickname(),
                            replies));
        }
        return result;
    }

    private FeedCommentResponse toCommentResponse(FeedPostComment row, List<FeedCommentResponse> replies) {
        return new FeedCommentResponse(
                row.getId(),
                row.getPostId(),
                row.getUserOpenid(),
                row.getNickname(),
                row.getAvatarUrl(),
                formatTimeText(row.getCreatedAt()),
                row.getContent(),
                row.getParentId(),
                row.getReplyToNickname() != null ? row.getReplyToNickname() : "",
                replies);
    }

    private void syncLikesCount(FeedPost post) {
        int count = (int) feedPostLikeRepository.countByPostId(post.getId());
        post.setLikesCount(count);
        feedPostRepository.save(post);
    }

    private void syncCommentsCount(FeedPost post) {
        int count = (int) feedPostCommentRepository.countByPostId(post.getId());
        post.setCommentsCount(count);
        feedPostRepository.save(post);
    }

    private FeedPost loadVisiblePost(long postId) {
        return feedPostRepository
                .findByIdAndStatus(postId, VISIBLE)
                .orElseThrow(() -> new IllegalArgumentException("动态不存在"));
    }

    static String formatTimeText(LocalDateTime at) {
        if (at == null) {
            return "";
        }
        Duration d = Duration.between(at, LocalDateTime.now());
        long minutes = d.toMinutes();
        if (minutes < 1) {
            return "刚刚";
        }
        if (minutes < 60) {
            return minutes + "分钟前";
        }
        long hours = d.toHours();
        if (hours < 24) {
            return hours + "小时前";
        }
        long days = d.toDays();
        if (days < 7) {
            return days + "天前";
        }
        return at.toLocalDate().toString();
    }

    private static String resolveUser(String userOpenid) {
        if (userOpenid == null || userOpenid.isBlank()) {
            return DEFAULT_USER_OPENID;
        }
        return userOpenid.trim();
    }
}
