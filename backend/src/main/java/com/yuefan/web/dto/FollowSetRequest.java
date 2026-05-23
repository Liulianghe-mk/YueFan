package com.yuefan.web.dto;

import jakarta.validation.constraints.NotNull;

public record FollowSetRequest(@NotNull Boolean following) {}
