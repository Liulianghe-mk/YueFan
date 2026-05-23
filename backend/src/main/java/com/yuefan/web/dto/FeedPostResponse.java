package com.yuefan.web.dto;

public record FeedPostResponse(
        long id,
        String authorName,
        String authorAvatarUrl,
        String timeText,
        String content,
        String imageUrl,
        String locationLabel,
        String gatherBadge,
        int likesCount,
        int commentsCount,
        int sharesCount,
        String status,
        int sortOrder,
        /** 与 authorName 匹配的大V id，用于关注；无匹配时为 null */
        Long authorInfluencerId,
        /** 小程序上下文：当前用户是否已点赞 */
        Boolean likedByMe) {}
