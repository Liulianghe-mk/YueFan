package com.yuefan.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "yuefan.security")
public class YuefanSecurityProperties {

    private String adminJwtSecret = "";
    private String appJwtSecret = "";
    private long adminJwtExpirationMs = 7200000L;
    private long appJwtExpirationMs = 2592000000L;
}
