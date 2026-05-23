package com.yuefan.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "yuefan.wx")
public class WxMiniappProperties {
    private String appId = "";
    private String appSecret = "";
}
