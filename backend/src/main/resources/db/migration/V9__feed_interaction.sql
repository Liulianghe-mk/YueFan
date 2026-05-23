-- 动态点赞与评论（含回复）

CREATE TABLE feed_post_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_openid VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_feed_like_post_user UNIQUE (post_id, user_openid)
);

CREATE TABLE feed_post_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_openid VARCHAR(64) NOT NULL,
    nickname VARCHAR(80) NOT NULL DEFAULT '',
    avatar_url VARCHAR(1024) NOT NULL DEFAULT '',
    content VARCHAR(1000) NOT NULL,
    parent_id BIGINT NULL,
    reply_to_nickname VARCHAR(80) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feed_comment_post ON feed_post_comment (post_id, created_at);
CREATE INDEX idx_feed_comment_parent ON feed_post_comment (parent_id);

-- 示例评论（与小程序 mock 对齐）
INSERT INTO feed_post_comment (post_id, user_openid, nickname, avatar_url, content, parent_id, reply_to_nickname, created_at)
VALUES
(
    1,
    'david-chen',
    'David Chen',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
    '氛围感拉满！下次周末早午餐算我一个～',
    NULL,
    '',
    CURRENT_TIMESTAMP
),
(
    1,
    'susu',
    '苏苏子',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80',
    '已收藏！正好下周在静安附近，想去试试。',
    NULL,
    '',
    CURRENT_TIMESTAMP
),
(
    1,
    'chef-wang',
    '王大厨',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&q=80',
    '配酒思路很专业，学习了。',
    NULL,
    '',
    CURRENT_TIMESTAMP
),
(
    2,
    'lin-xiaonuan',
    '林小暖',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    '这家我也去过，侍酒师确实厉害！',
    NULL,
    '',
    CURRENT_TIMESTAMP
),
(
    2,
    'susu',
    '苏苏子',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&q=80',
    '马克了，谢谢分享～',
    NULL,
    '',
    CURRENT_TIMESTAMP
);

UPDATE feed_post SET comments_count = (SELECT COUNT(*) FROM feed_post_comment WHERE post_id = feed_post.id);
