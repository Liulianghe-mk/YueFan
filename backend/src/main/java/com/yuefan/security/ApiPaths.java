package com.yuefan.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpMethod;

/** 与 SecurityConfig、JWT 过滤器共用的路径常量，避免大小写或拼写不一致。 */
public final class ApiPaths {

    public static final String ADMIN_LOGIN = "/api/admin/auth/login";
    public static final String APP_LOGIN = "/api/app/auth/login";
    public static final String APP_ACCOUNT_LOGIN = "/api/app/auth/login-account";
    public static final String APP_REGISTER = "/api/app/auth/register";
    public static final String APP_MEETUPS = "/api/app/meetups";
    public static final String APP_CHAT = "/api/app/chat";
    public static final String APP_FOLLOWS = "/api/app/follows";
    public static final String APP_MY = "/api/app/my";
    public static final String APP_FEED_POSTS = "/api/app/feed/posts";

    private ApiPaths() {}

    public static boolean isAdminLoginPath(String normalizedPath) {
        return ADMIN_LOGIN.equalsIgnoreCase(normalizedPath);
    }

    public static boolean isAppLoginPath(String normalizedPath) {
        return APP_LOGIN.equalsIgnoreCase(normalizedPath);
    }

    public static boolean isAppAuthPublicPath(String normalizedPath) {
        return isAppLoginPath(normalizedPath)
                || APP_ACCOUNT_LOGIN.equalsIgnoreCase(normalizedPath)
                || APP_REGISTER.equalsIgnoreCase(normalizedPath);
    }

    /** GET /api/app/meetups 及子路径，无需登录 */
    public static boolean isAppMeetupsPublicGet(HttpServletRequest request, String normalizedPath) {
        if (!HttpMethod.GET.matches(request.getMethod())) {
            return false;
        }
        if (APP_MEETUPS.equalsIgnoreCase(normalizedPath)) {
            return true;
        }
        String prefix = APP_MEETUPS + "/";
        return normalizedPath.regionMatches(true, 0, prefix, 0, prefix.length());
    }

    /** POST 小程序发起约饭（与 GET 同前缀，单独放行） */
    public static boolean isAppMeetupCreatePost(HttpServletRequest request, String normalizedPath) {
        String m = request.getMethod();
        boolean post = m != null && "POST".equalsIgnoreCase(m.trim());
        return post && APP_MEETUPS.equalsIgnoreCase(normalizedPath);
    }

    /** 小程序私信：GET/POST /api/app/chat/** 无需登录 */
    public static boolean isAppChatPublic(HttpServletRequest request, String normalizedPath) {
        if (!normalizedPath.regionMatches(true, 0, APP_CHAT, 0, APP_CHAT.length())) {
            return false;
        }
        if (normalizedPath.length() == APP_CHAT.length()) {
            return true;
        }
        return normalizedPath.charAt(APP_CHAT.length()) == '/';
    }

    /** 关注：GET/PUT /api/app/follows/** 无需登录（与私信一致，用 X-Miniapp-User 区分用户） */
    public static boolean isAppFollowPublic(HttpServletRequest request, String normalizedPath) {
        if (!normalizedPath.regionMatches(true, 0, APP_FOLLOWS, 0, APP_FOLLOWS.length())) {
            return false;
        }
        if (normalizedPath.length() == APP_FOLLOWS.length()) {
            return true;
        }
        return normalizedPath.charAt(APP_FOLLOWS.length()) == '/';
    }

    /** GET 小程序公开接口（无需登录） */
    public static boolean isAppPublicGet(HttpServletRequest request, String normalizedPath) {
        if (!HttpMethod.GET.matches(request.getMethod())) {
            return false;
        }
        if (isAppMeetupsPublicGet(request, normalizedPath)) {
            return true;
        }
        if ("/api/app/recommend-spots".equalsIgnoreCase(normalizedPath)) {
            return true;
        }
        if ("/api/app/hot-tags".equalsIgnoreCase(normalizedPath)) {
            return true;
        }
        if ("/api/app/discover-categories".equalsIgnoreCase(normalizedPath)) {
            return true;
        }
        if ("/api/app/influencers".equalsIgnoreCase(normalizedPath)) {
            return true;
        }
        String influencersPrefix = "/api/app/influencers/";
        if (normalizedPath.regionMatches(true, 0, influencersPrefix, 0, influencersPrefix.length())) {
            return true;
        }
        if ("/api/app/feed/posts".equalsIgnoreCase(normalizedPath)) {
            return true;
        }
        String feedPrefix = APP_FEED_POSTS + "/";
        return normalizedPath.regionMatches(true, 0, feedPrefix, 0, feedPrefix.length());
    }

    /** 我的活动与报名审核（GET/POST），与关注一致用 X-Miniapp-User，无需 JWT */
    public static boolean isAppMyPublic(HttpServletRequest request, String normalizedPath) {
        if (!normalizedPath.regionMatches(true, 0, APP_MY, 0, APP_MY.length())) {
            return false;
        }
        if (normalizedPath.length() == APP_MY.length()) {
            return true;
        }
        return normalizedPath.charAt(APP_MY.length()) == '/';
    }

    /** 约饭报名/取消（POST/DELETE join），无需 JWT */
    public static boolean isAppMeetupJoinPublic(HttpServletRequest request, String normalizedPath) {
        String m = request.getMethod();
        if (m == null) {
            return false;
        }
        String method = m.trim().toUpperCase();
        if (!"POST".equals(method) && !"DELETE".equals(method)) {
            return false;
        }
        String suffix = "/join";
        return normalizedPath.regionMatches(true, normalizedPath.length() - suffix.length(), suffix, 0, suffix.length())
                && normalizedPath.regionMatches(true, 0, APP_MEETUPS + "/", 0, (APP_MEETUPS + "/").length());
    }

    /** 动态点赞与评论（POST/DELETE），与关注一致用 X-Miniapp-User，无需 JWT */
    public static boolean isAppFeedInteractionPublic(HttpServletRequest request, String normalizedPath) {
        String m = request.getMethod();
        if (m == null) {
            return false;
        }
        String method = m.trim().toUpperCase();
        String prefix = APP_FEED_POSTS + "/";
        if (!normalizedPath.regionMatches(true, 0, prefix, 0, prefix.length())) {
            return false;
        }
        if (normalizedPath.endsWith("/like") && ("POST".equals(method) || "DELETE".equals(method))) {
            return true;
        }
        return normalizedPath.endsWith("/comments") && "POST".equals(method);
    }
}
