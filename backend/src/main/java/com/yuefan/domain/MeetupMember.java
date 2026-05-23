package com.yuefan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "meetup_member")
@Getter
@Setter
public class MeetupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meetup_id", nullable = false)
    private long meetupId;

    @Column(name = "user_openid", nullable = false, length = 64)
    private String userOpenid;

    @Column(nullable = false, length = 80)
    private String nickname = "";

    @Column(name = "avatar_url", nullable = false, length = 1024)
    private String avatarUrl = "";

    @Enumerated(EnumType.STRING)
    @Column(name = "member_status", nullable = false, length = 16)
    private MeetupMemberStatus memberStatus = MeetupMemberStatus.APPROVED;

    @Column(name = "is_host", nullable = false)
    private boolean isHost = false;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
}
