package com.yuefan.config;

import com.yuefan.security.AdminJwtAuthenticationFilter;
import com.yuefan.security.AppJwtAuthenticationFilter;
import com.yuefan.security.ApiPaths;
import com.yuefan.security.HttpRequestPaths;
import com.yuefan.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private static boolean pathStartsWithIgnoreCase(String path, String prefix) {
        if (path == null || prefix == null) {
            return false;
        }
        int n = prefix.length();
        return path.length() >= n && path.regionMatches(true, 0, prefix, 0, n);
    }

    private static RequestMatcher adminLoginOnly() {
        return request -> ApiPaths.isAdminLoginPath(HttpRequestPaths.normalizedPath(request));
    }

    /** 管理端除登录外的路径（避免与 Ant 链重叠时登录仍落入 JWT 链） */
    private static RequestMatcher adminExceptLogin() {
        return request -> {
            String p = HttpRequestPaths.normalizedPath(request);
            return pathStartsWithIgnoreCase(p, "/api/admin/") && !ApiPaths.isAdminLoginPath(p);
        };
    }

    private static RequestMatcher appLoginOnly() {
        return request -> ApiPaths.isAppAuthPublicPath(HttpRequestPaths.normalizedPath(request));
    }

    private static RequestMatcher appExceptLogin() {
        return request -> {
            String p = HttpRequestPaths.normalizedPath(request);
            return pathStartsWithIgnoreCase(p, "/api/app/") && !ApiPaths.isAppAuthPublicPath(p);
        };
    }

    private final JwtService jwtService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 登录单独一条链且不挂载 JWT 过滤器，避免 OncePerRequestFilter 在路径边缘情况下先于 permitAll
     * 拦截 POST /api/admin/auth/login（表现为「未登录或令牌无效」）。
     */
    @Bean
    @Order(0)
    public SecurityFilterChain adminLogin(HttpSecurity http) throws Exception {
        http.securityMatcher(adminLoginOnly())
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain adminApi(HttpSecurity http) throws Exception {
        AdminJwtAuthenticationFilter adminJwt = new AdminJwtAuthenticationFilter(jwtService);
        http.securityMatcher(adminExceptLogin())
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.OPTIONS, "/api/admin/**")
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated())
                .addFilterBefore(adminJwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain appLogin(HttpSecurity http) throws Exception {
        http.securityMatcher(appLoginOnly())
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(3)
    public SecurityFilterChain appApi(HttpSecurity http) throws Exception {
        AppJwtAuthenticationFilter appJwt = new AppJwtAuthenticationFilter(jwtService);
        http.securityMatcher(appExceptLogin())
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.OPTIONS, "/api/app/**")
                                        .permitAll()
                                        .requestMatchers(
                                                HttpMethod.POST,
                                                ApiPaths.APP_LOGIN,
                                                ApiPaths.APP_ACCOUNT_LOGIN,
                                                ApiPaths.APP_REGISTER)
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/meetups", HttpMethod.GET.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/meetups/**", HttpMethod.GET.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/meetups", HttpMethod.POST.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/meetups/*/join", HttpMethod.POST.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/meetups/*/join", HttpMethod.DELETE.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/meetups/*/members", HttpMethod.GET.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/my/**", HttpMethod.GET.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/my/**", HttpMethod.POST.name(), false))
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/app/recommend-spots")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/app/hot-tags")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/app/discover-categories")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/app/influencers", "/api/app/influencers/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/app/feed/posts", "/api/app/feed/posts/**")
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/feed/posts/*/like", HttpMethod.POST.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/feed/posts/*/like", HttpMethod.DELETE.name(), false))
                                        .permitAll()
                                        .requestMatchers(
                                                new AntPathRequestMatcher(
                                                        "/api/app/feed/posts/*/comments", HttpMethod.POST.name(), false))
                                        .permitAll()
                                        .requestMatchers("/api/app/chat", "/api/app/chat/**")
                                        .permitAll()
                                        .requestMatchers("/api/app/follows", "/api/app/follows/**")
                                        .permitAll()
                                        .anyRequest()
                                        .authenticated())
                .addFilterBefore(appJwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    @Order(4)
    public SecurityFilterChain fallback(HttpSecurity http) throws Exception {
        http.securityMatcher(new AntPathRequestMatcher("/**"))
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(
                        auth ->
                                auth.requestMatchers(HttpMethod.GET, "/", "/error")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/uploads/**")
                                        .permitAll()
                                        .anyRequest()
                                        .denyAll());
        return http.build();
    }
}
