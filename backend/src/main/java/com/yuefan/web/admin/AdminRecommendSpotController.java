package com.yuefan.web.admin;

import com.yuefan.service.RecommendSpotAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.RecommendSpotResponse;
import com.yuefan.web.dto.RecommendSpotWriteRequest;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/recommend-spots")
@RequiredArgsConstructor
public class AdminRecommendSpotController {

    private final RecommendSpotAdminService recommendSpotAdminService;

    @GetMapping
    public ApiResponse<Page<RecommendSpotResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                recommendSpotAdminService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<RecommendSpotResponse> get(@PathVariable long id) {
        return ApiResponse.ok(recommendSpotAdminService.get(id));
    }

    @PostMapping
    public ApiResponse<RecommendSpotResponse> create(@Valid @RequestBody RecommendSpotWriteRequest request) {
        return ApiResponse.ok(recommendSpotAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RecommendSpotResponse> update(
            @PathVariable long id, @Valid @RequestBody RecommendSpotWriteRequest request) {
        return ApiResponse.ok(recommendSpotAdminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        recommendSpotAdminService.delete(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
