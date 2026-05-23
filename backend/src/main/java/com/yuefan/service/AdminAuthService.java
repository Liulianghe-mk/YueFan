package com.yuefan.service;

import com.yuefan.config.YuefanSecurityProperties;
import com.yuefan.domain.AdminUser;
import com.yuefan.repository.AdminUserRepository;
import com.yuefan.security.JwtService;
import com.yuefan.web.dto.AdminLoginRequest;
import com.yuefan.web.dto.TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final YuefanSecurityProperties securityProperties;

    @Transactional(readOnly = true)
    public TokenResponse login(AdminLoginRequest req) {
        AdminUser user =
                adminUserRepository
                        .findByUsername(req.username())
                        .orElseThrow(() -> new BadCredentialsException("用户名或密码错误"));
        if (!user.isEnabled()) {
            throw new BadCredentialsException("账号已禁用");
        }
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("用户名或密码错误");
        }
        String token = jwtService.createAdminToken(user.getUsername());
        long expSec = Math.max(1L, securityProperties.getAdminJwtExpirationMs() / 1000);
        return new TokenResponse(token, "Bearer", expSec);
    }
}
