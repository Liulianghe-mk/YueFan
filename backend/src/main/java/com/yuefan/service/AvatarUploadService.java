package com.yuefan.service;

import com.yuefan.config.YuefanUploadProperties;
import com.yuefan.domain.AppUser;
import com.yuefan.repository.AppUserRepository;
import com.yuefan.web.dto.AppMeResponse;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AvatarUploadService {

    private static final long MAX_BYTES = 2L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif", "application/octet-stream");

    private final YuefanUploadProperties uploadProperties;
    private final AppUserRepository appUserRepository;

    @Transactional
    public AppMeResponse uploadAndBind(String openid, MultipartFile file, String requestBaseUrl) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("请选择头像图片");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("头像不能超过 2MB");
        }
        String contentType = resolveImageContentType(file);

        String ext = extensionFor(contentType);
        String safeOpenid = openid.replaceAll("[^a-zA-Z0-9._-]", "_");
        String filename = safeOpenid + "_" + System.currentTimeMillis() + ext;

        Path avatarDir = uploadProperties.uploadRoot().resolve("avatars");
        try {
            Files.createDirectories(avatarDir);
            Path target = avatarDir.resolve(filename);
            file.transferTo(target);
        } catch (IOException e) {
            throw new IllegalStateException("保存头像失败", e);
        }

        String base = requestBaseUrl == null ? "" : requestBaseUrl.replaceAll("/+$", "");
        String avatarUrl = base + uploadProperties.normalizedPublicPrefix() + "/avatars/" + filename;

        AppUser u =
                appUserRepository
                        .findByOpenid(openid)
                        .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        u.setAvatarUrl(avatarUrl);
        appUserRepository.save(u);

        return new AppMeResponse(
                u.getId(),
                u.getOpenid(),
                u.getNickname(),
                u.getAvatarUrl(),
                u.getLevelText(),
                u.getBio(),
                AppUserService.isProfileComplete(u));
    }

    private static String resolveImageContentType(MultipartFile file) {
        String raw = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (ALLOWED_CONTENT_TYPES.contains(raw) && !"application/octet-stream".equals(raw)) {
            return raw;
        }
        String name = file.getOriginalFilename();
        if (name != null) {
            String lower = name.toLowerCase(Locale.ROOT);
            if (lower.endsWith(".png")) {
                return "image/png";
            }
            if (lower.endsWith(".webp")) {
                return "image/webp";
            }
            if (lower.endsWith(".gif")) {
                return "image/gif";
            }
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                return "image/jpeg";
            }
        }
        if ("application/octet-stream".equals(raw) || raw.isEmpty()) {
            return "image/jpeg";
        }
        throw new IllegalArgumentException("仅支持 JPG、PNG、WebP、GIF");
    }

    private static String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
