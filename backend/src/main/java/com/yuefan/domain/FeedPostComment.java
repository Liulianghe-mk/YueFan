package com.yuefan.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "feed_post_comment")
@Getter
@Setter
public class FeedPostComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private long postId;

    @Column(name = "user_openid", nullable = false, length = 64)
    private String userOpenid;

    @Column(nullable = false, length = 80)
    private String nickname = "";

    @Column(name = "avatar_url", nullable = false, length = 1024)
    private String avatarUrl = "";

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "reply_to_nickname", nullable = false, length = 80)
    private String replyToNickname = "";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
