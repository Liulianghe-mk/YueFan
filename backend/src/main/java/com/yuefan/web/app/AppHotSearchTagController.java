package com.yuefan.web.app;

import com.yuefan.service.HotSearchTagAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.HotSearchTagResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/hot-tags")
@RequiredArgsConstructor
public class AppHotSearchTagController {

    private final HotSearchTagAdminService hotSearchTagAdminService;

    @GetMapping
    public ApiResponse<List<HotSearchTagResponse>> list() {
        return ApiResponse.ok(hotSearchTagAdminService.listEnabled());
    }
}
