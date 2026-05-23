package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AppMeUpdateRequest(
        @NotBlank @Size(min = 2, max = 80) String nickname,
        @Size(max = 1024) String avatarUrl,
        @Size(max = 500) String bio) {}
