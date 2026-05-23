package com.yuefan.security;

import com.yuefan.config.YuefanSecurityProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final YuefanSecurityProperties props;

    public String createAdminToken(String username) {
        return buildToken(username, "admin", props.getAdminJwtSecret(), props.getAdminJwtExpirationMs());
    }

    public String createAppToken(String openid) {
        return buildToken(openid, "app", props.getAppJwtSecret(), props.getAppJwtExpirationMs());
    }

    public Optional<Claims> parseAdminToken(String token) {
        return parse(token, props.getAdminJwtSecret(), "admin");
    }

    public Optional<Claims> parseAppToken(String token) {
        return parse(token, props.getAppJwtSecret(), "app");
    }

    private String buildToken(String subject, String typ, String secret, long ttlMs) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + ttlMs);
        return Jwts.builder()
                .subject(subject)
                .claim("typ", typ)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key(secret))
                .compact();
    }

    private Optional<Claims> parse(String token, String secret, String expectedTyp) {
        try {
            Claims claims =
                    Jwts.parser().verifyWith(key(secret)).build().parseSignedClaims(token).getPayload();
            if (!expectedTyp.equals(claims.get("typ"))) {
                return Optional.empty();
            }
            return Optional.of(claims);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private static SecretKey key(String secret) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(bytes);
    }
}
