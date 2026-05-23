package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DiscoverCategoryWriteRequest(
        @NotBlank String name, @NotNull Integer sortOrder, @NotNull Boolean enabled) {}
