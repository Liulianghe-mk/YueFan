package com.yuefan.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AppAccountLoginRequest(
        @NotBlank(message = "请输入账号") @Size(min = 3, max = 32, message = "账号长度为 3-32 位")
                String username,
        @NotBlank(message = "请输入密码") @Size(min = 6, max = 64, message = "密码至少 6 位")
                String password) {}
