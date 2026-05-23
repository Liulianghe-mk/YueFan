-- 与小程序：发现推荐、搜索热词、发现分类、动态流、大V 展示 对应

CREATE TABLE recommend_spot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    image_url VARCHAR(1024) NOT NULL,
    rating DOUBLE NOT NULL DEFAULT 5.0,
    tags VARCHAR(500) NOT NULL DEFAULT '',
    price_yuan INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hot_search_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE discover_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feed_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(80) NOT NULL,
    author_avatar_url VARCHAR(1024) NOT NULL,
    time_text VARCHAR(64) NOT NULL DEFAULT '',
    content VARCHAR(4000) NOT NULL,
    image_url VARCHAR(1024) NOT NULL DEFAULT '',
    location_label VARCHAR(200) NOT NULL DEFAULT '',
    gather_badge VARCHAR(64) NOT NULL DEFAULT '',
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    shares_count INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE influencer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(80) NOT NULL,
    avatar_url VARCHAR(1024) NOT NULL,
    badge_label VARCHAR(64) NOT NULL DEFAULT '',
    rating_text VARCHAR(16) NOT NULL DEFAULT '',
    bio VARCHAR(500) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO recommend_spot (name, image_url, rating, tags, price_yuan, sort_order, status)
VALUES
(
    '瑞穗寿司',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDE9Cx3W-BI4zAI5z3h3AdDdpmDFsEZPBxu9U_TMIW1BhVVSBtVFwYx-QLHNnUFpYDU0imrpzT7HQoz7R9kX5vCLV4ljFMBiGl20yE8nTe1JQnIvfCiWnfl8DKzNH_gobDFlUkGelLlTRCZxDeiZYqiKAxuIDU6do8eZS4eQS6aW1C0-fndRG-yxdxGgjhlu7AbDhv-RmxxdHHInlkqKyC2obCeoSroTe9MAAm9VjxXHvBww9MiV_yaN7UUeh7ZI0VUc4gjJN7qGt5G',
    4.9,
    '日料,精致餐饮',
    580,
    20,
    'PUBLISHED'
),
(
    'Canvas 烘焙坊',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBGZenKcM-NHbWtA5xXRGd1u5w3bjXSnpoeRO9GkwcVyi3K2xc9OZdET6-08slwLXDp71a4ae9JEmzGAmNkndVc8tN2BaQdqG4qQG99r4d1LRTliHMsydvsULvl7P2N0PDBMAoPkHV0WMEicGHgjGXqZ7gFt5jaxI5sny65QkY2UXwnmm4mCX21j6YacemYLwkbAYnddX6HlPhnyzQmVsVEvXg_52GDoD8anOn3uSszPqIh6cHB-BiEKWcUNigyAGlvE2gXkaw6fysY',
    4.7,
    '咖啡馆,生活方式',
    85,
    10,
    'PUBLISHED'
);

INSERT INTO hot_search_tag (label, sort_order, enabled) VALUES
('寿司', 10, TRUE),
('外滩', 20, TRUE),
('早茶', 30, TRUE),
('咖啡', 40, TRUE),
('静安', 50, TRUE),
('日料', 60, TRUE);

INSERT INTO discover_category (name, sort_order, enabled) VALUES
('全部', 5, TRUE),
('火锅', 30, TRUE),
('日料', 20, TRUE),
('咖啡馆', 40, TRUE),
('烧烤', 50, TRUE);

INSERT INTO feed_post (
    author_name,
    author_avatar_url,
    time_text,
    content,
    image_url,
    location_label,
    gather_badge,
    likes_count,
    comments_count,
    shares_count,
    status,
    sort_order
)
VALUES
(
    '林小暖',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    '2小时前',
    '今晚在 Commune Social 的小聚太治愈了！创意西班牙 tapas 配酒，每一道都像在舌尖跳舞。',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=80',
    '静安区 · The Commune Social',
    '8人已聚',
    128,
    24,
    8,
    'VISIBLE',
    20
),
(
    'David Chen',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
    '5小时前',
    '周末意式小馆探店记录：手工意面与侍酒师的推荐绝配，推荐给同样喜欢慢食的你。',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80',
    '徐汇区 · Osteria',
    '5人已聚',
    86,
    12,
    5,
    'VISIBLE',
    10
);

INSERT INTO influencer (display_name, avatar_url, badge_label, rating_text, bio, sort_order, enabled)
VALUES
(
    '林小暖',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBlR4_WIpScneQLXCSnqXJ679JVI3rz418VHC-Hb327GYdsy7rGpgpbOczqcHxCU11__MsBq1d38qV-9xvjXdfhSPgJEAaKmQTy1eVpj4ktowXLrytamToiSEnteg3LG6iUWQTzjEJnxPEksekIIwJ2klopElHVIXD1KN5PyruOAIw0vnefDiUJcuqvACGWlNj3sF2JB0CncGt0xrEvUuhHDAPKCDxvVnXalSanUM7NnMd2SkPes1JddqViJpwav4nPw-5raDYJjPfz',
    '认证美食家',
    '4.9',
    '热爱城市小馆与周末早午餐。',
    20,
    TRUE
),
(
    'David Chen',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
    '侍酒师',
    '4.8',
    '意餐与葡萄酒搭配。',
    10,
    TRUE
);
