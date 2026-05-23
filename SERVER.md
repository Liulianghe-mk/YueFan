# 约饭小程序仓库说明

本目录为 **微信小程序** 前端；已增加：

- **`backend/`**：Spring Boot 3.2 API（管理端 + 小程序双通道 JWT、约饭 CRUD、Flyway + H2）。
- **`admin-web/`**：Vue 3 独立管理后台（登录、约饭活动表格与表单）。

联调：先 `backend` 里 `mvn spring-boot:run`，再 `admin-web` 里 `npm run dev`。详见各自目录下 `README.md`。
