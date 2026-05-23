package com.yuefan.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class UploadResourceConfig implements WebMvcConfigurer {

    private final YuefanUploadProperties uploadProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String prefix = uploadProperties.normalizedPublicPrefix();
        String location = uploadProperties.uploadRoot().toUri().toString();
        if (!location.endsWith("/")) {
            location = location + "/";
        }
        registry.addResourceHandler(prefix + "/**").addResourceLocations(location);
    }
}
