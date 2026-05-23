package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 小程序发布动态；默认 status=PENDING，管理端审核后改为 VISIBLE 才在列表展示。 */
public record FeedPostAppCreateRequest(
        @Size(max = 80) String authorName,
        @Size(max = 1024) String authorAvatarUrl,
        @NotBlank @Size(max = 4000) String content,
        @Size(max = 1024) String imageUrl,
        @Size(max = 200) String locationLabel,
        @Size(max = 64) String gatherBadge) {}
