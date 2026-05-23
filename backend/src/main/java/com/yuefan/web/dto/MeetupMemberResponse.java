package com.yuefan.web.dto;

import java.time.LocalDateTime;

public record MeetupMemberResponse(
        long id,
        long meetupId,
        String userOpenid,
        String nickname,
        String avatarUrl,
        LocalDateTime joinedAt,
        String memberStatus,
        boolean isHost) {}
