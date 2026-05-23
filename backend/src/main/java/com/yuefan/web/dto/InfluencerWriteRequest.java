package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InfluencerWriteRequest(
        @NotBlank String displayName,
        @NotBlank String avatarUrl,
        String badgeLabel,
        String ratingText,
        String bio,
        @NotNull Integer sortOrder,
        @NotNull Boolean enabled) {}
