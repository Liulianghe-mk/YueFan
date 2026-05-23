-- 约饭列表/详情展示字段，与管理端 MeetupsView、小程序 yuefan 卡片对齐

ALTER TABLE meetup ADD COLUMN category_tag VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN description VARCHAR(280) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN distance_label VARCHAR(32) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN district VARCHAR(24) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN host_name VARCHAR(40) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN host_avatar_url VARCHAR(1024) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN host_rating VARCHAR(8) NOT NULL DEFAULT '';
ALTER TABLE meetup ADD COLUMN host_badge VARCHAR(32) NOT NULL DEFAULT '';

UPDATE meetup SET category_tag = '约饭' WHERE category_tag = '';
