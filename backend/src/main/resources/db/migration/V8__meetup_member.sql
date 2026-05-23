-- 约饭报名记录（joined_count 与成员数同步）

CREATE TABLE meetup_member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meetup_id BIGINT NOT NULL,
    user_openid VARCHAR(64) NOT NULL,
    nickname VARCHAR(80) NOT NULL DEFAULT '',
    avatar_url VARCHAR(1024) NOT NULL DEFAULT '',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_meetup_member_meetup_user UNIQUE (meetup_id, user_openid),
    CONSTRAINT fk_meetup_member_meetup FOREIGN KEY (meetup_id) REFERENCES meetup (id) ON DELETE CASCADE
);

CREATE INDEX idx_meetup_member_meetup ON meetup_member (meetup_id);
CREATE INDEX idx_meetup_member_user ON meetup_member (user_openid);
