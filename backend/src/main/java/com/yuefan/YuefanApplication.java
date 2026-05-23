package com.yuefan;

import com.yuefan.config.YuefanUploadProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(YuefanUploadProperties.class)
public class YuefanApplication {

    public static void main(String[] args) {
        SpringApplication.run(YuefanApplication.class, args);
    }
}
