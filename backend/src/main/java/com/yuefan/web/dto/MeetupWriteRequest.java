package com.yuefan.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MeetupWriteRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 64) String categoryTag,
        @Size(max = 280) String description,
        @Size(max = 32) String distanceLabel,
        @Size(max = 24) String district,
        @NotBlank @Size(max = 255) String locationLabel,
        @NotBlank @Size(max = 120) String timeLabel,
        @NotBlank @Size(max = 1024) String coverUrl,
        @Size(max = 40) String hostName,
        @Size(max = 1024) String hostAvatarUrl,
        @Size(max = 8) String hostRating,
        @Size(max = 32) String hostBadge,
        @NotNull @Min(0) Integer joinedCount,
        @NotNull @Min(1) Integer totalSlots,
        @NotBlank String status) {}
