package com.yuefan.web.app;

import com.yuefan.service.RecommendSpotAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.RecommendSpotResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/recommend-spots")
@RequiredArgsConstructor
public class AppRecommendSpotController {

    private final RecommendSpotAdminService recommendSpotAdminService;

    @GetMapping
    public ApiResponse<List<RecommendSpotResponse>> list() {
        return ApiResponse.ok(recommendSpotAdminService.listPublished());
    }
}
