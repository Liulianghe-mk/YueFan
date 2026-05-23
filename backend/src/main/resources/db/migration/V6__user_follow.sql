-- 小程序用户关注大V（influencer）

CREATE TABLE user_follow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_openid VARCHAR(64) NOT NULL,
    influencer_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_follow_user_influencer UNIQUE (user_openid, influencer_id)
);

CREATE INDEX idx_user_follow_user ON user_follow (user_openid);
CREATE INDEX idx_user_follow_influencer ON user_follow (influencer_id);
