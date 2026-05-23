package com.yuefan.web.dto;

import java.time.LocalDateTime;

public record AdminUserListItem(long id, String username, String role, boolean enabled, LocalDateTime createdAt) {}
