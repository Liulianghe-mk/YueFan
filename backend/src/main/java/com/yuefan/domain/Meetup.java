package com.yuefan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "meetup")
@Getter
@Setter
public class Meetup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "location_label", nullable = false)
    private String locationLabel;

    @Column(name = "time_label", nullable = false, length = 120)
    private String timeLabel;

    @Column(name = "cover_url", nullable = false, length = 1024)
    private String coverUrl;

    @Column(name = "joined_count", nullable = false)
    private int joinedCount;

    @Column(name = "total_slots", nullable = false)
    private int totalSlots;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MeetupStatus status = MeetupStatus.DRAFT;

    @Column(name = "category_tag", nullable = false, length = 64)
    private String categoryTag = "";

    @Column(nullable = false, length = 280)
    private String description = "";

    @Column(name = "distance_label", nullable = false, length = 32)
    private String distanceLabel = "";

    @Column(nullable = false, length = 24)
    private String district = "";

    @Column(name = "host_name", nullable = false, length = 40)
    private String hostName = "";

    @Column(name = "host_avatar_url", nullable = false, length = 1024)
    private String hostAvatarUrl = "";

    @Column(name = "host_rating", nullable = false, length = 8)
    private String hostRating = "";

    @Column(name = "host_badge", nullable = false, length = 32)
    private String hostBadge = "";

    @Column(name = "host_openid", nullable = false, length = 64)
    private String hostOpenid = "";

    @Column(name = "require_approval", nullable = false)
    private boolean requireApproval = false;

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
