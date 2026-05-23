package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FeedCommentCreateRequest(
        @NotBlank @Size(max = 1000) String content,
        /** 回复时传顶层评论 id */
        Long parentId) {}
