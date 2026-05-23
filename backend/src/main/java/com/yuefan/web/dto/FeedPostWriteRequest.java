package com.yuefan.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FeedPostWriteRequest(
        @NotBlank String authorName,
        @NotBlank String authorAvatarUrl,
        String timeText,
        @NotBlank String content,
        String imageUrl,
        String locationLabel,
        String gatherBadge,
        @NotNull @Min(0) Integer likesCount,
        @NotNull @Min(0) Integer commentsCount,
        @NotNull @Min(0) Integer sharesCount,
        @NotBlank String status,
        @NotNull Integer sortOrder) {}
