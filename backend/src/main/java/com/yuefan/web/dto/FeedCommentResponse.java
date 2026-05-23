package com.yuefan.web.dto;

import java.util.List;

public record FeedCommentResponse(
        long id,
        long postId,
        String userOpenid,
        String authorName,
        String authorAvatarUrl,
        String timeText,
        String content,
        Long parentId,
        String replyToNickname,
        List<FeedCommentResponse> replies) {}
