package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatConversationEnsureRequest(
        @Size(max = 32) String peerId,
        @NotBlank @Size(max = 80) String peerName,
        @Size(max = 1024) String peerAvatarUrl,
        @Size(max = 200) String contextLabel,
        @Size(max = 500) String greeting) {}
