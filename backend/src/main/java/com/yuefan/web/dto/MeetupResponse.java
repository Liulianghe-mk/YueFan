package com.yuefan.web.dto;

public record MeetupResponse(
        long id,
        String title,
        String locationLabel,
        String timeLabel,
        String coverUrl,
        int joinedCount,
        int totalSlots,
        String status,
        String categoryTag,
        String description,
        String distanceLabel,
        String district,
        String hostName,
        String hostAvatarUrl,
        String hostRating,
        String hostBadge,
        /** 小程序上下文：当前用户是否已通过审核加入 */
        Boolean joinedByMe,
        /** 小程序上下文：是否还可报名/申请 */
        Boolean canJoin,
        /** 当前用户是否为发起人 */
        Boolean isHost,
        /** 报名是否需要发起人审核 */
        Boolean requireApproval,
        /** 当前用户报名状态：APPROVED / PENDING / REJECTED，未报名为 null */
        String myMembershipStatus,
        /** 发起人视角：待审核申请人数 */
        Integer pendingApplicationCount) {}
