package com.yuefan.web.app;

import com.yuefan.service.DiscoverCategoryAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.DiscoverCategoryResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/discover-categories")
@RequiredArgsConstructor
public class AppDiscoverCategoryController {

    private final DiscoverCategoryAdminService discoverCategoryAdminService;

    @GetMapping
    public ApiResponse<List<DiscoverCategoryResponse>> list() {
        return ApiResponse.ok(discoverCategoryAdminService.listEnabled());
    }
}
