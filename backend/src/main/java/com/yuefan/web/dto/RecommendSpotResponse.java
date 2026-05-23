package com.yuefan.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecommendSpotResponse(
        long id,
        String name,
        String imageUrl,
        double rating,
        String tags,
        String address,
        String businessHours,
        int priceYuan,
        int sortOrder,
        String status) {}
