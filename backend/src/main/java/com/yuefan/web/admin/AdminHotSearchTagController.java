package com.yuefan.web.admin;

import com.yuefan.service.HotSearchTagAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.HotSearchTagResponse;
import com.yuefan.web.dto.HotSearchTagWriteRequest;
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
@RequestMapping("/api/admin/hot-search-tags")
@RequiredArgsConstructor
public class AdminHotSearchTagController {

    private final HotSearchTagAdminService hotSearchTagAdminService;

    @GetMapping
    public ApiResponse<Page<HotSearchTagResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size) {
        return ApiResponse.ok(
                hotSearchTagAdminService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<HotSearchTagResponse> get(@PathVariable long id) {
        return ApiResponse.ok(hotSearchTagAdminService.get(id));
    }

    @PostMapping
    public ApiResponse<HotSearchTagResponse> create(@Valid @RequestBody HotSearchTagWriteRequest request) {
        return ApiResponse.ok(hotSearchTagAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<HotSearchTagResponse> update(
            @PathVariable long id, @Valid @RequestBody HotSearchTagWriteRequest request) {
        return ApiResponse.ok(hotSearchTagAdminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        hotSearchTagAdminService.delete(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
