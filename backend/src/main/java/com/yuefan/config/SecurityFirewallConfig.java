package com.yuefan.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.firewall.StrictHttpFirewall;

/**
 * 微信开发者工具 / 真机 {@code wx.request} 可能携带非常规 Header（编码、代理链等），默认
 * {@link StrictHttpFirewall} 会抛出 {@code RequestRejectedException}，客户端表现为 HTTP 403。
 * 本 API 无表单 Cookie 会话，适当放宽 Header 校验可避免小程序 POST 被误拦。
 */
@Configuration
public class SecurityFirewallConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowedHeaderNames(name -> true);
        firewall.setAllowedHeaderValues(value -> true);
        return web -> web.httpFirewall(firewall);
    }
}
