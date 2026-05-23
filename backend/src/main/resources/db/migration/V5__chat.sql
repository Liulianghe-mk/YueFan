-- 小程序私信：会话与消息

CREATE TABLE chat_conversation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_openid VARCHAR(64) NOT NULL,
    peer_key VARCHAR(64) NOT NULL,
    peer_id VARCHAR(32) NOT NULL DEFAULT '',
    peer_name VARCHAR(80) NOT NULL,
    peer_avatar_url VARCHAR(1024) NOT NULL DEFAULT '',
    context_label VARCHAR(200) NOT NULL DEFAULT '',
    last_message VARCHAR(500) NOT NULL DEFAULT '',
    unread_for_user INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_chat_conv_user_peer UNIQUE (user_openid, peer_key)
);

CREATE INDEX idx_chat_conv_updated ON chat_conversation (updated_at DESC);

CREATE TABLE chat_message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_type VARCHAR(16) NOT NULL,
    content VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_msg_conv ON chat_message (conversation_id, id);

INSERT INTO chat_conversation (
    user_openid, peer_key, peer_id, peer_name, peer_avatar_url, context_label, last_message, unread_for_user
)
VALUES
(
    'miniapp-user',
    'p-1',
    '1',
    '林小暖',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    '约饭 · Commune Social 小聚',
    '那周六 12 点见，我订位啦～',
    1
);

INSERT INTO chat_message (conversation_id, sender_type, content)
SELECT c.id, 'PEER', '你好呀，看到你对 Commune Social 那场约饭感兴趣？'
FROM chat_conversation c WHERE c.peer_key = 'p-1' AND c.user_openid = 'miniapp-user';

INSERT INTO chat_message (conversation_id, sender_type, content)
SELECT c.id, 'USER', '对的！我想一起参加，还有名额吗？'
FROM chat_conversation c WHERE c.peer_key = 'p-1' AND c.user_openid = 'miniapp-user';

INSERT INTO chat_message (conversation_id, sender_type, content)
SELECT c.id, 'PEER', '那周六 12 点见，我订位啦～'
FROM chat_conversation c WHERE c.peer_key = 'p-1' AND c.user_openid = 'miniapp-user';
