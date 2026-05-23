package com.yuefan.web.dto;

public record ChatMessageResponse(
        long id,
        long conversationId,
        String from,
        String content,
        String time) {}
