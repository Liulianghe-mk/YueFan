package com.yuefan.web.dto;

public record MeetupJoinResponse(MeetupResponse meetup, boolean alreadyJoined, boolean pendingApproval) {}
