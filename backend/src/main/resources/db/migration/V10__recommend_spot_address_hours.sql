-- 推荐详情：地址与营业时间（管理端可编辑）

ALTER TABLE recommend_spot ADD COLUMN address VARCHAR(300) NOT NULL DEFAULT '';
ALTER TABLE recommend_spot ADD COLUMN business_hours VARCHAR(200) NOT NULL DEFAULT '';

UPDATE recommend_spot SET address = '上海市黄浦区外滩金融中心 B1-08', business_hours = '11:30–14:00，17:30–22:00'
WHERE name = '瑞穗寿司';

UPDATE recommend_spot SET address = '上海市徐汇区安福路 322 号 1 层', business_hours = '08:00–20:00'
WHERE name = 'Canvas 烘焙坊';
