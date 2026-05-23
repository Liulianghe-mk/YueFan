package com.yuefan.security;

import jakarta.servlet.http.HttpServletRequest;

/** Servlet path helpers so JWT filters match Spring MVC routes reliably. */
public final class HttpRequestPaths {

    private HttpRequestPaths() {}

    /**
     * Path for routing checks: strips query, removes {@code contextPath}, ensures leading {@code /},
     * removes trailing slashes (except root).
     */
    public static String normalizedPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null || uri.isEmpty()) {
            return "";
        }
        int q = uri.indexOf('?');
        if (q >= 0) {
            uri = uri.substring(0, q);
        }
        int semi = uri.indexOf(';');
        if (semi >= 0) {
            uri = uri.substring(0, semi);
        }
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty() && uri.startsWith(contextPath)) {
            uri = uri.substring(contextPath.length());
        }
        if (uri.isEmpty()) {
            return "/";
        }
        if (!uri.startsWith("/")) {
            uri = "/" + uri;
        }
        while (uri.contains("//")) {
            uri = uri.replace("//", "/");
        }
        while (uri.length() > 1 && uri.endsWith("/")) {
            uri = uri.substring(0, uri.length() - 1);
        }
        return uri;
    }
}
