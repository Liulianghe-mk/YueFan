package com.yuefan.web.admin;

import com.yuefan.service.AppUserAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.AppUserResponse;
import com.yuefan.web.dto.AppUserWriteRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/app-users")
@RequiredArgsConstructor
public class AdminAppUserController {

    private final AppUserAdminService appUserAdminService;

    @GetMapping
    public ApiResponse<Page<AppUserResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(
                appUserAdminService.list(keyword, PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<AppUserResponse> get(@PathVariable long id) {
        return ApiResponse.ok(appUserAdminService.get(id));
    }

    @PostMapping
    public ApiResponse<AppUserResponse> create(@Valid @RequestBody AppUserWriteRequest request) {
        return ApiResponse.ok(appUserAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<AppUserResponse> update(
            @PathVariable long id, @Valid @RequestBody AppUserWriteRequest request) {
        return ApiResponse.ok(appUserAdminService.update(id, request));
    }
}
