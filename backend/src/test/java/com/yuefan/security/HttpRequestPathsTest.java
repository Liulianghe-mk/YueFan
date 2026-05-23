package com.yuefan.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class HttpRequestPathsTest {

    @Test
    void normalizedPathMatchesAdminLogin() {
        MockHttpServletRequest r = new MockHttpServletRequest("POST", "/api/admin/auth/login");
        String p = HttpRequestPaths.normalizedPath(r);
        assertThat(p).isEqualTo("/api/admin/auth/login");
        assertThat(ApiPaths.isAdminLoginPath(p)).isTrue();
    }

    @Test
    void normalizedPathMatchesAppRegister() {
        MockHttpServletRequest r = new MockHttpServletRequest("POST", "/api/app/auth/register");
        String p = HttpRequestPaths.normalizedPath(r);
        assertThat(p).isEqualTo("/api/app/auth/register");
        assertThat(ApiPaths.isAppAuthPublicPath(p)).isTrue();
    }

    @Test
    void normalizedPathStripsMatrixOrSessionSuffix() {
        MockHttpServletRequest r = new MockHttpServletRequest("POST", "/api/app/meetups;jsessionid=ABC");
        String p = HttpRequestPaths.normalizedPath(r);
        assertThat(p).isEqualTo("/api/app/meetups");
        assertThat(ApiPaths.isAppMeetupCreatePost(r, p)).isTrue();
    }
}
