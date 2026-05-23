package com.yuefan.web.app;

import com.yuefan.service.AppAuthService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.AppAccountLoginRequest;
import com.yuefan.web.dto.AppAccountRegisterRequest;
import com.yuefan.web.dto.AppLoginRequest;
import com.yuefan.web.dto.TokenResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/auth")
@RequiredArgsConstructor
public class AppAuthController {

    private final AppAuthService appAuthService;

    /** 微信 code / 开发 dev 登录 */
    @PostMapping("/login")
    public ApiResponse<TokenResponse> login(@Valid @RequestBody AppLoginRequest request) {
        return ApiResponse.ok(appAuthService.login(request.code()));
    }

    @PostMapping("/login-account")
    public ApiResponse<TokenResponse> loginAccount(@Valid @RequestBody AppAccountLoginRequest request) {
        return ApiResponse.ok(appAuthService.loginWithAccount(request));
    }

    @PostMapping("/register")
    public ApiResponse<TokenResponse> register(@Valid @RequestBody AppAccountRegisterRequest request) {
        return ApiResponse.ok(appAuthService.register(request));
    }
}
