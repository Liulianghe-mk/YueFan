-- 小程序账号密码登录

ALTER TABLE app_user ADD COLUMN username VARCHAR(32) NULL;
ALTER TABLE app_user ADD COLUMN password_hash VARCHAR(255) NULL;

CREATE UNIQUE INDEX uk_app_user_username ON app_user (username);
