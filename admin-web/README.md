# 约饭 · 管理端（Vue 3）

Vue 3 + Vite + TypeScript + Element Plus + Pinia + Vue Router。

## 开发

需先启动后端（`backend`，端口 8080）。本工程通过 Vite 将 `/api` 代理到 `http://127.0.0.1:8080`。

```bash
cd admin-web
npm install
npm run dev
```

浏览器打开终端提示的地址（一般为 `http://localhost:5173`；若端口被占用会改用 5174 等），使用 `admin` / `admin123` 登录。

**私信**：登录后左侧 **动态与达人 → 私信会话**（或直接访问 `/chat-messages`）。需后端已执行 Flyway `V5__chat.sql` 并重启；首次启动会有一条示例会话（林小暖）。若界面仍是旧版，请关掉其它 `npm run dev` 窗口后只保留一个，并 **Ctrl+F5** 强刷。

**小程序用户**：左侧 **小程序用户** 可查看账号注册/登录用户（列「账号」「登录方式」）；与小程序 `POST /api/app/auth/register`、`login-account` 共用 `app_user` 表。演示账号 `demo` / `demo123` 启动后端后自动创建。

## 与本仓库小程序本地联调

三者共用同一后端 **`http://127.0.0.1:8080`**：

1. 先启动 **backend**（见 `../backend/README.md`）。
2. **管理端**：本目录 `npm run dev`，`VITE_API_BASE` 开发环境留空即可，请求走 Vite 代理的 `/api` → 8080；在后台维护约饭活动后保存。
3. **小程序**：仓库根目录 `utils/config.js` 中 `apiBase` 已为 `http://127.0.0.1:8080`。在微信开发者工具中打开项目，**详情 → 本地设置 → 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**，再编译「发现 / 约饭」页即可拉取 `GET /api/app/meetups` 与后台数据一致。私信走 `/api/app/chat/**`，管理端在「私信会话」查看并代回。其余只读接口见管理端概览页：`/api/app/recommend-spots`、`/api/app/hot-tags`、`/api/app/discover-categories`、`/api/app/feed/posts`、`/api/app/influencers`（小程序可按需逐步接入）。

真机调试手机访问不到电脑的 `127.0.0.1`，需改为电脑 **局域网 IP**（如 `http://192.168.x.x:8080`）或部署到公网后再改 `apiBase`。

## 生产构建

```bash
npm run build
```

产物在 `dist/`，可部署到任意静态站点；此时需在 `.env.production` 中设置：

```env
VITE_API_BASE=https://你的API域名
```

使浏览器直接请求 HTTPS API（并确保后端 CORS 允许该管理端域名）。
