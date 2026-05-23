package com.yuefan.service;

import com.yuefan.domain.AppUser;
import com.yuefan.repository.AppUserRepository;
import com.yuefan.repository.ChatConversationRepository;
import com.yuefan.repository.UserFollowRepository;
import com.yuefan.web.dto.AppUserResponse;
import com.yuefan.web.dto.AppUserWriteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppUserAdminService {

    private final AppUserRepository appUserRepository;
    private final UserFollowRepository userFollowRepository;
    private final ChatConversationRepository chatConversationRepository;

    @Transactional(readOnly = true)
    public Page<AppUserResponse> list(String keyword, Pageable pageable) {
        String kw = keyword == null ? "" : keyword.trim();
        Page<AppUser> page =
                kw.isEmpty()
                        ? appUserRepository.findAllByOrderByIdDesc(pageable)
                        : appUserRepository.search(kw, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AppUserResponse get(long id) {
        return toResponse(load(id));
    }

    @Transactional
    public AppUserResponse create(AppUserWriteRequest req) {
        String openid = req.openid() == null ? "" : req.openid().trim();
        if (openid.isEmpty()) {
            throw new IllegalArgumentException("请填写 OpenID");
        }
        if (appUserRepository.existsByOpenid(openid)) {
            throw new IllegalArgumentException("OpenID 已存在");
        }
        AppUser u = new AppUser();
        u.setOpenid(openid);
        applyProfile(u, req);
        return toResponse(appUserRepository.save(u));
    }

    @Transactional
    public AppUserResponse update(long id, AppUserWriteRequest req) {
        AppUser u = load(id);
        applyProfile(u, req);
        return toResponse(appUserRepository.save(u));
    }

    private AppUser load(long id) {
        return appUserRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("用户不存在"));
    }

    private void applyProfile(AppUser u, AppUserWriteRequest req) {
        u.setNickname(req.nickname().trim());
        u.setAvatarUrl(req.avatarUrl() != null ? req.avatarUrl().trim() : "");
        u.setLevelText(req.levelText() != null && !req.levelText().isBlank() ? req.levelText().trim() : "LV.1");
        u.setBio(req.bio() != null ? req.bio().trim() : "");
        u.setEnabled(req.enabled());
    }

    private AppUserResponse toResponse(AppUser u) {
        String openid = u.getOpenid();
        String username = u.getUsername();
        boolean accountLogin =
                username != null
                        && !username.isBlank()
                        && u.getPasswordHash() != null
                        && !u.getPasswordHash().isBlank();
        return new AppUserResponse(
                u.getId(),
                openid,
                username,
                accountLogin,
                u.getNickname(),
                u.getAvatarUrl(),
                u.getLevelText(),
                u.getBio(),
                u.isEnabled(),
                u.getLastLoginAt(),
                u.getCreatedAt(),
                userFollowRepository.countByUserOpenid(openid),
                chatConversationRepository.countByUserOpenid(openid));
    }
}
