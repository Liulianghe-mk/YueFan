package com.yuefan.web.admin;

import com.yuefan.service.AdminAuthService;
import com.yuefan.web.dto.AdminLoginRequest;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ApiResponse.ok(adminAuthService.login(request));
    }
}
