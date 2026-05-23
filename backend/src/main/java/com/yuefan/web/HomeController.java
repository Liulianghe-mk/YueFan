package com.yuefan.web;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> api = new LinkedHashMap<>();
        api.put("adminLogin", "POST /api/admin/auth/login");
        api.put("adminMeetups", "/api/admin/meetups");
        api.put("adminRecommendSpots", "/api/admin/recommend-spots");
        api.put("adminHotSearchTags", "/api/admin/hot-search-tags");
        api.put("adminDiscoverCategories", "/api/admin/discover-categories");
        api.put("adminFeedPosts", "/api/admin/feed-posts");
        api.put("adminFeedComments", "GET|DELETE /api/admin/feed-posts/{id}/comments");
        api.put("appFeedLike", "POST|DELETE /api/app/feed/posts/{id}/like");
        api.put("appFeedComments", "GET|POST /api/app/feed/posts/{id}/comments");
        api.put("adminInfluencers", "/api/admin/influencers");
        api.put("adminChat", "/api/admin/chat/conversations");
        api.put("adminSystemUsers", "GET /api/admin/system-users");
        api.put("adminAppUsers", "/api/admin/app-users");
        api.put("appMeetups", "GET|POST /api/app/meetups");
        api.put("appMeetupJoin", "POST|DELETE /api/app/meetups/{id}/join");
        api.put("adminMeetupMembers", "GET /api/admin/meetups/{id}/members");
        api.put("appRecommendSpots", "GET /api/app/recommend-spots");
        api.put("appHotTags", "GET /api/app/hot-tags");
        api.put("appDiscoverCategories", "GET /api/app/discover-categories");
        api.put("appFeedPosts", "GET /api/app/feed/posts");
        api.put("appInfluencers", "GET /api/app/influencers");
        api.put("appFollows", "GET|PUT /api/app/follows/**");
        api.put("appMe", "GET|PUT /api/app/me");
        api.put("appLogin", "POST /api/app/auth/login");
        api.put("appAccountLogin", "POST /api/app/auth/login-account");
        api.put("appRegister", "POST /api/app/auth/register");
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "yuefan-backend");
        body.put("message", "API 已就绪；浏览器请访问下方路径或打开 admin-web 管理端。");
        body.put("api", api);
        return body;
    }
}
