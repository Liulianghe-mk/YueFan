package com.yuefan.config;

import com.yuefan.domain.AdminUser;
import com.yuefan.domain.AppUser;
import com.yuefan.repository.AdminUserRepository;
import com.yuefan.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeedConfig {

    private static final String DEMO_USERNAME = "demo";
    private static final String DEMO_PASSWORD = "demo123";
    private static final String DEMO_OPENID = "acct:demo";

    private final AdminUserRepository adminUserRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedAdminUser() {
        return args -> {
            if (adminUserRepository.count() > 0) {
                return;
            }
            AdminUser u = new AdminUser();
            u.setUsername("admin");
            u.setPasswordHash(passwordEncoder.encode("admin123"));
            u.setRole("ROLE_ADMIN");
            u.setEnabled(true);
            adminUserRepository.save(u);
        };
    }

    @Bean
    CommandLineRunner seedDemoAppUser() {
        return args -> {
            var existing = appUserRepository.findByUsername(DEMO_USERNAME);
            if (existing.isPresent()) {
                AppUser u = existing.get();
                boolean needsSave = false;
                if (u.getPasswordHash() == null || u.getPasswordHash().isBlank()) {
                    u.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
                    needsSave = true;
                }
                if (u.getOpenid() == null || u.getOpenid().isBlank()) {
                    u.setOpenid(DEMO_OPENID);
                    needsSave = true;
                }
                if (!u.isEnabled()) {
                    u.setEnabled(true);
                    needsSave = true;
                }
                if (needsSave) {
                    appUserRepository.save(u);
                }
                return;
            }
            AppUser u = new AppUser();
            u.setUsername(DEMO_USERNAME);
            u.setOpenid(DEMO_OPENID);
            u.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
            u.setNickname("演示用户");
            u.setAvatarUrl("");
            u.setLevelText("LV.1");
            u.setBio("");
            u.setEnabled(true);
            appUserRepository.save(u);
        };
    }
}
