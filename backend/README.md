# 约饭 · Spring Boot 后端

Java 17 + Spring Boot 3.2，内置 **H2 内存库**（开箱即跑），Flyway 建表与示例约饭数据；管理端与小程序分 **双 JWT** 与 **双 SecurityFilterChain**。

## 运行

```bash
cd backend
mvn spring-boot:run
```

默认端口 `8080`。

## 管理端账号（开发）

首次启动自动写入数据库：

- 用户名：`admin`
- 密码：`admin123`

**生产环境务必修改密码与 `application.yml` 中的 `yuefan.security.*-jwt-secret`。**

## 主要接口

| 说明 | 方法 | 路径 |
|------|------|------|
| 管理登录 | POST | `/api/admin/auth/login` |
| 约饭分页 CRUD | * | `/api/admin/meetups` |
| 小程序登录 | POST | `/api/app/auth/login` body `{ "code": "dev" }`（未配微信时） |
| 小程序账号登录 | POST | `/api/app/auth/login-account` body `{ "username", "password" }` |
| 小程序账号注册 | POST | `/api/app/auth/register` body `{ "username", "password", "nickname", ... }` |
| 小程序上传头像 | POST | `/api/app/me/avatar` multipart `file`（需 App JWT） |

开发演示账号（启动后自动创建）：`demo` / `demo123`

本地建议用文件库保留账号：`mvn spring-boot:run -Dspring-boot.run.profiles=local`
| 当前用户资料 | GET | `/api/app/me`（需 Bearer） |
| 完善/更新资料 | PUT | `/api/app/me` body `{ "nickname", "avatarUrl?", "bio?" }` |
| 小程序公开列表 | GET | `/api/app/meetups` |
| 小程序加入约饭 | POST | `/api/app/meetups/{id}/join` |
| 小程序取消报名 | DELETE | `/api/app/meetups/{id}/join` |
| 小程序报名者列表 | GET | `/api/app/meetups/{id}/members` |
| 管理 · 活动报名者 | GET | `/api/admin/meetups/{id}/members` |
| 小程序 · 为你推荐 | GET | `/api/app/recommend-spots` |
| 小程序 · 搜索热词 | GET | `/api/app/hot-tags` |
| 小程序 · 发现分类 | GET | `/api/app/discover-categories` |
| 小程序 · 动态（展示） | GET | `/api/app/feed/posts` 及 `/api/app/feed/posts/{id}` |
| 小程序 · 大V | GET | `/api/app/influencers` |
| 管理 · 为你推荐 CRUD | * | `/api/admin/recommend-spots` |
| 管理 · 搜索热词 CRUD | * | `/api/admin/hot-search-tags` |
| 管理 · 发现分类 CRUD | * | `/api/admin/discover-categories` |
| 管理 · 动态 CRUD | * | `/api/admin/feed-posts` |
| 管理 · 动态评论 | GET/DELETE | `/api/admin/feed-posts/{id}/comments` |
| 小程序 · 动态点赞 | POST/DELETE | `/api/app/feed/posts/{id}/like` |
| 小程序 · 动态评论 | GET/POST | `/api/app/feed/posts/{id}/comments` |
| 管理 · 大V CRUD | * | `/api/admin/influencers` |
| 管理 · 小程序用户 CRUD | * | `/api/admin/app-users` |
| 管理 · 管理员列表（只读） | GET | `/api/admin/system-users` |

配置微信后，在 `application.yml` 填写 `yuefan.wx.app-id`、`yuefan.wx.app-secret`，`/api/app/auth/login` 将使用 `jscode2session` 换 `openid`。

## CORS

`yuefan.cors.allowed-origins` 默认包含本地 `admin-web`（5173/5174）及 `https://servicewechat.com`，供管理端与微信侧请求带 `Origin` 时不被拦截。

## 与小程序本地联调

1. 启动本服务（端口 `8080`）。
2. 小程序项目里 `utils/config.js` 设置 `apiBase: 'http://127.0.0.1:8080'`（与默认端口一致）。
3. 微信开发者工具：**不校验合法域名**（本地 HTTP 必须）。

公开列表：`GET /api/app/meetups`；管理端经 `admin-web` 的 Vite 代理访问 `/api/admin/**`。详见 `../admin-web/README.md`「与本仓库小程序本地联调」。

## 生产建议

- 数据源改为 MySQL，保留 Flyway。
- 使用环境变量注入 JWT 密钥与微信密钥。
- Nginx 终止 TLS，反代到本服务。
