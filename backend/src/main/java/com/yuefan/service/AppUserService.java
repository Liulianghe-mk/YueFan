package com.yuefan.service;

import com.yuefan.domain.AppUser;
import com.yuefan.repository.AppUserRepository;
import com.yuefan.web.dto.AppMeResponse;
import com.yuefan.web.dto.AppMeUpdateRequest;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository appUserRepository;

    @Transactional
    public AppUser ensureUser(String openid) {
        String oid = openid == null ? "" : openid.trim();
        if (oid.isEmpty()) {
            throw new IllegalArgumentException("openid 无效");
        }
        return appUserRepository
                .findByOpenid(oid)
                .map(
                        existing -> {
                            existing.setLastLoginAt(LocalDateTime.now());
                            return appUserRepository.save(existing);
                        })
                .orElseGet(() -> createDefault(oid));
    }

    private AppUser createDefault(String openid) {
        AppUser u = new AppUser();
        u.setOpenid(openid);
        u.setNickname(defaultNickname(openid));
        u.setAvatarUrl("");
        u.setLevelText("LV.1");
        u.setBio("");
        u.setEnabled(true);
        u.setLastLoginAt(LocalDateTime.now());
        return appUserRepository.save(u);
    }

    static String defaultNickname(String openid) {
        String tail = openid.length() <= 6 ? openid : openid.substring(openid.length() - 6);
        return "用户_" + tail;
    }

    @Transactional(readOnly = true)
    public AppMeResponse getMe(String openid) {
        return toMeResponse(ensureUser(openid));
    }

    @Transactional
    public AppMeResponse updateMe(String openid, AppMeUpdateRequest req) {
        AppUser u = ensureUser(openid);
        u.setNickname(req.nickname().trim());
        if (req.avatarUrl() != null) {
            u.setAvatarUrl(req.avatarUrl().trim());
        }
        if (req.bio() != null) {
            u.setBio(req.bio().trim());
        }
        return toMeResponse(appUserRepository.save(u));
    }

    private AppMeResponse toMeResponse(AppUser u) {
        return new AppMeResponse(
                u.getId(),
                u.getOpenid(),
                u.getNickname(),
                u.getAvatarUrl(),
                u.getLevelText(),
                u.getBio(),
                isProfileComplete(u));
    }

    static boolean isProfileComplete(AppUser u) {
        String nick = u.getNickname();
        if (nick == null || nick.isBlank() || nick.length() < 2) {
            return false;
        }
        return !nick.startsWith("用户_");
    }
}
