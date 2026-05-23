package com.yuefan.web.dto;

public record ChatConversationResponse(
        long id,
        String userOpenid,
        String peerKey,
        String peerId,
        String peerName,
        String peerAvatarUrl,
        String contextLabel,
        String lastMessage,
        String lastTime,
        int unreadForUser) {}
