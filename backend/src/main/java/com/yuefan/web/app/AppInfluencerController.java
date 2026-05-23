package com.yuefan.web.app;

import com.yuefan.service.InfluencerAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.InfluencerResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/influencers")
@RequiredArgsConstructor
public class AppInfluencerController {

    private final InfluencerAdminService influencerAdminService;

    @GetMapping
    public ApiResponse<List<InfluencerResponse>> list() {
        return ApiResponse.ok(influencerAdminService.listEnabled());
    }

    /** 个人主页：仅返回已启用达人，与列表口径一致 */
    @GetMapping("/{id}")
    public ApiResponse<InfluencerResponse> get(@PathVariable long id) {
        InfluencerResponse r = influencerAdminService.get(id);
        if (!r.enabled()) {
            throw new IllegalArgumentException("大V不存在");
        }
        return ApiResponse.ok(r);
    }
}
