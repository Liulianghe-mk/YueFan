package com.yuefan.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * 小程序「发起约饭」提交体。由服务端固定 joinedCount，并根据 publicInvite 决定状态。
 */
public record MeetupAppCreateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 255) String locationLabel,
        @NotBlank @Size(max = 120) String timeLabel,
        @Size(max = 1024) String coverUrl,
        @NotNull @Min(2) @Max(30) Integer totalSlots,
        Boolean publicInvite,
        Boolean requireApproval) {}
