package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record HotSearchTagWriteRequest(
        @NotBlank String label, @NotNull Integer sortOrder, @NotNull Boolean enabled) {}
