package com.yuefan.web.dto;

import java.time.LocalDateTime;

public record AppUserResponse(
        long id,
        String openid,
        String username,
        boolean accountLogin,
        String nickname,
        String avatarUrl,
        String levelText,
        String bio,
        boolean enabled,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        long followCount,
        long conversationCount) {}
