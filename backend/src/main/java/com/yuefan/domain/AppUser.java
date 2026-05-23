package com.yuefan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "app_user")
@Getter
@Setter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64, unique = true)
    private String openid;

    @Column(length = 32, unique = true)
    private String username;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 80)
    private String nickname;

    @Column(name = "avatar_url", nullable = false, length = 1024)
    private String avatarUrl = "";

    @Column(name = "level_text", nullable = false, length = 32)
    private String levelText = "LV.1";

    @Column(nullable = false, length = 500)
    private String bio = "";

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
