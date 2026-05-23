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
@Table(name = "feed_post")
@Getter
@Setter
public class FeedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author_name", nullable = false, length = 80)
    private String authorName;

    @Column(name = "author_avatar_url", nullable = false, length = 1024)
    private String authorAvatarUrl;

    @Column(name = "time_text", nullable = false, length = 64)
    private String timeText = "";

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl = "";

    @Column(name = "location_label", nullable = false, length = 200)
    private String locationLabel = "";

    @Column(name = "gather_badge", nullable = false, length = 64)
    private String gatherBadge = "";

    @Column(name = "likes_count", nullable = false)
    private int likesCount;

    @Column(name = "comments_count", nullable = false)
    private int commentsCount;

    @Column(name = "shares_count", nullable = false)
    private int sharesCount;

    @Column(nullable = false, length = 32)
    private String status = "PENDING";

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

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
