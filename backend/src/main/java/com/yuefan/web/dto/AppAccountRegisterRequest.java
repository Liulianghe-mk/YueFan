package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AppAccountRegisterRequest(
        @NotBlank(message = "请输入账号") @Size(min = 3, max = 32, message = "账号长度为 3-32 位")
                String username,
        @NotBlank(message = "请输入密码") @Size(min = 6, max = 64, message = "密码至少 6 位")
                String password,
        @NotBlank(message = "请输入昵称") @Size(min = 2, max = 20, message = "昵称长度为 2-20 字")
                String nickname,
        @Size(max = 1024) String avatarUrl,
        @Size(max = 500) String bio) {}
