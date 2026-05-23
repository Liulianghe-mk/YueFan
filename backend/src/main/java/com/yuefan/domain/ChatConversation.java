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
@Table(name = "chat_conversation")
@Getter
@Setter
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_openid", nullable = false, length = 64)
    private String userOpenid;

    @Column(name = "peer_key", nullable = false, length = 64)
    private String peerKey;

    @Column(name = "peer_id", nullable = false, length = 32)
    private String peerId = "";

    @Column(name = "peer_name", nullable = false, length = 80)
    private String peerName;

    @Column(name = "peer_avatar_url", nullable = false, length = 1024)
    private String peerAvatarUrl = "";

    @Column(name = "context_label", nullable = false, length = 200)
    private String contextLabel = "";

    @Column(name = "last_message", nullable = false, length = 500)
    private String lastMessage = "";

    @Column(name = "unread_for_user", nullable = false)
    private int unreadForUser;

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
