package com.yuefan.web.dto;

public record MyActivityItemResponse(
        long meetupId,
        String title,
        String venue,
        String timeLabel,
        String coverUrl,
        String monthLabel,
        String dayLabel,
        /** confirmed | pending | manage */
        String cardStatus,
        /** detail | manage */
        String action,
        boolean isHost,
        String myMembershipStatus,
        int pendingApplicantCount,
        int joinedCount,
        int totalSlots) {}
