package com.yuefan.web.dto;

public record InfluencerResponse(
        long id,
        String displayName,
        String avatarUrl,
        String badgeLabel,
        String ratingText,
        String bio,
        int sortOrder,
        boolean enabled) {}
