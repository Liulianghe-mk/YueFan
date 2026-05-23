package com.yuefan.web.admin;

import com.yuefan.service.DiscoverCategoryAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.DiscoverCategoryResponse;
import com.yuefan.web.dto.DiscoverCategoryWriteRequest;
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
@RequestMapping("/api/admin/discover-categories")
@RequiredArgsConstructor
public class AdminDiscoverCategoryController {

    private final DiscoverCategoryAdminService discoverCategoryAdminService;

    @GetMapping
    public ApiResponse<Page<DiscoverCategoryResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(
                discoverCategoryAdminService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<DiscoverCategoryResponse> get(@PathVariable long id) {
        return ApiResponse.ok(discoverCategoryAdminService.get(id));
    }

    @PostMapping
    public ApiResponse<DiscoverCategoryResponse> create(@Valid @RequestBody DiscoverCategoryWriteRequest request) {
        return ApiResponse.ok(discoverCategoryAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DiscoverCategoryResponse> update(
            @PathVariable long id, @Valid @RequestBody DiscoverCategoryWriteRequest request) {
        return ApiResponse.ok(discoverCategoryAdminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        discoverCategoryAdminService.delete(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
