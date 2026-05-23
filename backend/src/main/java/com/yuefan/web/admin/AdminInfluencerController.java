package com.yuefan.web.admin;

import com.yuefan.service.InfluencerAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.InfluencerResponse;
import com.yuefan.web.dto.InfluencerWriteRequest;
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
@RequestMapping("/api/admin/influencers")
@RequiredArgsConstructor
public class AdminInfluencerController {

    private final InfluencerAdminService influencerAdminService;

    @GetMapping
    public ApiResponse<Page<InfluencerResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                influencerAdminService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<InfluencerResponse> get(@PathVariable long id) {
        return ApiResponse.ok(influencerAdminService.get(id));
    }

    @PostMapping
    public ApiResponse<InfluencerResponse> create(@Valid @RequestBody InfluencerWriteRequest request) {
        return ApiResponse.ok(influencerAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<InfluencerResponse> update(
            @PathVariable long id, @Valid @RequestBody InfluencerWriteRequest request) {
        return ApiResponse.ok(influencerAdminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        influencerAdminService.delete(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
