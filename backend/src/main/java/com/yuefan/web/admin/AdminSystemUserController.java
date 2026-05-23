package com.yuefan.web.admin;

import com.yuefan.service.AdminSystemUserService;
import com.yuefan.web.dto.AdminUserListItem;
import com.yuefan.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system-users")
@RequiredArgsConstructor
public class AdminSystemUserController {

    private final AdminSystemUserService adminSystemUserService;

    @GetMapping
    public ApiResponse<Page<AdminUserListItem>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                adminSystemUserService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }
}
