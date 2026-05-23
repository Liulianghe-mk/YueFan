package com.yuefan.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "yuefan.upload")
public class YuefanUploadProperties {

    /** 本地存储根目录 */
    private String dir = "./uploads";

    /** 对外访问路径前缀，如 /uploads */
    private String publicPrefix = "/uploads";

    public Path uploadRoot() {
        return Paths.get(dir).toAbsolutePath().normalize();
    }

    public String normalizedPublicPrefix() {
        String p = publicPrefix == null ? "/uploads" : publicPrefix.trim();
        if (!p.startsWith("/")) {
            p = "/" + p;
        }
        while (p.endsWith("/") && p.length() > 1) {
            p = p.substring(0, p.length() - 1);
        }
        return p;
    }
}
