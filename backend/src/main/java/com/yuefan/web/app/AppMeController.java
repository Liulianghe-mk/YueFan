package com.yuefan.web.app;

import com.yuefan.service.AppUserService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.AppMeResponse;
import com.yuefan.web.dto.AppMeUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import com.yuefan.service.AvatarUploadService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/app/me")
@RequiredArgsConstructor
public class AppMeController {

    private final AppUserService appUserService;
    private final AvatarUploadService avatarUploadService;

    @GetMapping
    public ApiResponse<AppMeResponse> me(Authentication authentication) {
        return ApiResponse.ok(appUserService.getMe(requireOpenid(authentication)));
    }

    @PutMapping
    public ApiResponse<AppMeResponse> update(
            @Valid @RequestBody AppMeUpdateRequest request, Authentication authentication) {
        return ApiResponse.ok(appUserService.updateMe(requireOpenid(authentication), request));
    }

    /** 上传头像文件并写入用户资料（小程序 wx.uploadFile） */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AppMeResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication,
            HttpServletRequest request) {
        String baseUrl =
                ServletUriComponentsBuilder.fromRequestUri(request)
                        .replacePath(null)
                        .replaceQuery(null)
                        .build()
                        .toUriString();
        return ApiResponse.ok(
                avatarUploadService.uploadAndBind(requireOpenid(authentication), file, baseUrl));
    }

    private static String requireOpenid(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("未登录");
        }
        return authentication.getName();
    }
}
