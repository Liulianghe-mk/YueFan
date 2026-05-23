package com.yuefan.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecommendSpotWriteRequest(
        @NotBlank String name,
        @NotBlank String imageUrl,
        @NotNull Double rating,
        String tags,
        String address,
        String businessHours,
        @NotNull @Min(0) Integer priceYuan,
        @NotNull Integer sortOrder,
        @NotBlank String status) {}
