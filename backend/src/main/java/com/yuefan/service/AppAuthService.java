package com.yuefan.service;

import com.yuefan.config.WxMiniappProperties;
import com.yuefan.config.YuefanSecurityProperties;
import com.yuefan.domain.AppUser;
import com.yuefan.repository.AppUserRepository;
import com.yuefan.security.JwtService;
import com.yuefan.web.dto.AppAccountLoginRequest;
import com.yuefan.web.dto.AppAccountRegisterRequest;
import com.yuefan.web.dto.TokenResponse;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AppAuthService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,32}$");

    private final WxMiniappProperties wxMiniappProperties;
    private final JwtService jwtService;
    private final YuefanSecurityProperties securityProperties;
    private final AppUserService appUserService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate = new RestTemplate();

    public TokenResponse login(String code) {
        String trimmed = code == null ? "" : code.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("请提供微信 code");
        }
        if (!wxMiniappProperties.getAppId().isBlank() && !wxMiniappProperties.getAppSecret().isBlank()) {
            String url =
                    String.format(
                            "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                            wxMiniappProperties.getAppId(),
                            wxMiniappProperties.getAppSecret(),
                            trimmed);
            @SuppressWarnings("unchecked")
            Map<String, Object> body = restTemplate.getForObject(url, Map.class);
            if (body != null && body.get("openid") instanceof String openid) {
                return buildToken(openid);
            }
            throw new IllegalArgumentException("微信登录失败，请检查 code 或后台配置");
        }
        if ("dev".equalsIgnoreCase(trimmed)) {
            return buildToken("dev-openid");
        }
        throw new IllegalArgumentException("未配置 yuefan.wx.app-id / app-secret 时，请使用 code=dev 进行本地调试");
    }

    @Transactional
    public TokenResponse loginWithAccount(AppAccountLoginRequest req) {
        String username = normalizeUsername(req.username());
        AppUser user =
                appUserRepository
                        .findByUsername(username)
                        .orElseThrow(() -> new BadCredentialsException("用户名或密码错误"));
        if (!user.isEnabled()) {
            throw new BadCredentialsException("账号已禁用");
        }
        String hash = user.getPasswordHash();
        if (hash == null || hash.isBlank() || !passwordEncoder.matches(req.password(), hash)) {
            throw new BadCredentialsException("用户名或密码错误");
        }
        user.setLastLoginAt(LocalDateTime.now());
        appUserRepository.save(user);
        return issueToken(user.getOpenid());
    }

    @Transactional
    public TokenResponse register(AppAccountRegisterRequest req) {
        String username = normalizeUsername(req.username());
        if (appUserRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("用户名已存在");
        }
        String openid = accountOpenid(username);
        AppUser u = new AppUser();
        u.setOpenid(openid);
        u.setUsername(username);
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        u.setNickname(req.nickname().trim());
        u.setAvatarUrl(req.avatarUrl() == null ? "" : req.avatarUrl().trim());
        u.setBio(req.bio() == null ? "" : req.bio().trim());
        u.setLevelText("LV.1");
        u.setEnabled(true);
        u.setLastLoginAt(LocalDateTime.now());
        appUserRepository.save(u);
        return issueToken(openid);
    }

    static String normalizeUsername(String raw) {
        if (raw == null) {
            throw new IllegalArgumentException("请输入账号");
        }
        String username = raw.trim().toLowerCase();
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("账号仅支持字母、数字与下划线，长度 3-32 位");
        }
        return username;
    }

    static String accountOpenid(String username) {
        return "acct:" + username;
    }

    private TokenResponse buildToken(String openid) {
        appUserService.ensureUser(openid);
        return issueToken(openid);
    }

    private TokenResponse issueToken(String openid) {
        String token = jwtService.createAppToken(openid);
        long expSec = Math.max(1L, securityProperties.getAppJwtExpirationMs() / 1000);
        return new TokenResponse(token, "Bearer", expSec);
    }
}
