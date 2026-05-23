package com.yuefan.web.dto;

public record AppMeResponse(
        long id,
        String openid,
        String nickname,
        String avatarUrl,
        String levelText,
        String bio,
        boolean profileComplete) {}
