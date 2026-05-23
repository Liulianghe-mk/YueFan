-- 小程序用户（微信 openid 或开发占位 openid）

CREATE TABLE app_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(64) NOT NULL,
    nickname VARCHAR(80) NOT NULL,
    avatar_url VARCHAR(1024) NOT NULL DEFAULT '',
    level_text VARCHAR(32) NOT NULL DEFAULT 'LV.1',
    bio VARCHAR(500) NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_app_user_openid UNIQUE (openid)
);

CREATE INDEX idx_app_user_enabled ON app_user (enabled);
CREATE INDEX idx_app_user_nickname ON app_user (nickname);

-- 从已有私信、关注记录导入 openid
INSERT INTO app_user (openid, nickname, avatar_url, level_text, bio, enabled, created_at, updated_at)
SELECT u.openid,
       CONCAT('用户_', RIGHT(u.openid, GREATEST(6, CHAR_LENGTH(u.openid)))),
       '',
       'LV.1',
       '',
       TRUE,
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM (
    SELECT user_openid AS openid FROM chat_conversation
    UNION
    SELECT user_openid AS openid FROM user_follow
) u
WHERE u.openid IS NOT NULL AND TRIM(u.openid) <> '';
