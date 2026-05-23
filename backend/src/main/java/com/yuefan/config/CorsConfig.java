package com.yuefan.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${yuefan.cors.allowed-origins:http://localhost:5173}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        for (String origin : allowedOrigins.split(",")) {
            String o = origin.trim();
            if (!o.isEmpty()) {
                config.addAllowedOriginPattern(o);
            }
        }
        // 微信开发者工具 / 真机预览的 Origin 多样（含随机端口、内嵌 WebView 等）。allowCredentials=true 时
        // 通配 Origin 受限，易误判为 CORS 失败 → 浏览器/内核报 HTTP 403。本 API 仅用 Header JWT，无需跨域 Cookie。
        config.setAllowCredentials(false);
        config.addAllowedOriginPattern("*");
        /*
         * 1) 允许任意 HTTP 方法：仅用 List.of(GET,POST,...) 在部分合并场景下可能导致实际请求方法校验失败 →
         *    DefaultCorsProcessor 返回 403，且响应里出现 Allow: GET。
         * 2) HTTPS 页面（如 servicewechat.com 工具壳）访问本机 http://127.0.0.1 属「私网访问」，浏览器会带
         *    Access-Control-Request-Private-Network；需显式允许，否则预检/实际请求易被 CORS 拒绝。
         */
        config.setAllowPrivateNetwork(true);
        config.setAllowedMethods(List.of(CorsConfiguration.ALL));
        config.setAllowedHeaders(List.of(CorsConfiguration.ALL));
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
