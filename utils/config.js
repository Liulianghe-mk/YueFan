/**
 * 后端 API 根地址（不要末尾 /）。本地联调请与 `backend` 的 `server.port` 一致（默认 8080）。
 *
 * 【重要】真机 / 手机预览：
 * - 手机上的 127.0.0.1 是「手机自己」，不是你的电脑 → 会出现 request:fail net::ERR_CONNECTION_REFUSED
 * - 请把 apiBase 改成电脑在同一 WiFi 下的局域网 IP，例如 http://192.168.x.x:8080
 * - Windows：cmd 里执行 ipconfig，看「无线局域网适配器 WLAN」的 IPv4
 * - 手机与电脑须同一 WiFi；电脑防火墙需放行 8080；后端须在运行（cd backend → mvn spring-boot:run）
 *
 * 微信开发者工具（仅模拟器）：可用 http://127.0.0.1:8080
 * 详情 → 本地设置 → 勾选「不校验合法域名、web-view、TLS…」
 *
 * 不配后端时改为 apiBase: ''，列表与私信走本地示例数据。
 */
/** 真机预览/调试必须为 true；仅电脑模拟器可 false 用 127.0.0.1 */
var USE_LAN_FOR_PHONE = true;

/** 电脑局域网 IP（ipconfig 查看，会随网络变化） */
var apiBaseLan = 'http://192.168.101.38:8080';

var apiBaseLocal = 'http://127.0.0.1:8080';

module.exports = {
  apiBase: USE_LAN_FOR_PHONE ? apiBaseLan : apiBaseLocal,
};
