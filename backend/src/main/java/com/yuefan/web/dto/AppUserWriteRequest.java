package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AppUserWriteRequest(
        String openid,
        @NotBlank String nickname,
        String avatarUrl,
        String levelText,
        String bio,
        @NotNull Boolean enabled) {}
