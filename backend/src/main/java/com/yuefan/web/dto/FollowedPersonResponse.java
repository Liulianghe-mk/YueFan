package com.yuefan.web.dto;

/** 当前用户关注的人（大V），用于「我的 · 结识的好友」等 */
public record FollowedPersonResponse(long id, String displayName, String avatarUrl) {}
