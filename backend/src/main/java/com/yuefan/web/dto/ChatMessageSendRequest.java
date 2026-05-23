package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatMessageSendRequest(@NotBlank @Size(max = 4000) String content) {}
