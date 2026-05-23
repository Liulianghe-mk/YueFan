package com.yuefan.web.dto;

/** 微信 code 或开发占位登录（code=dev），与账号密码登录接口分离。 */
public record AppLoginRequest(String code) {}
