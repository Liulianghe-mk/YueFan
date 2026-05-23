package com.yuefan.web.dto;

public record TokenResponse(String accessToken, String tokenType, long expiresIn) {}
