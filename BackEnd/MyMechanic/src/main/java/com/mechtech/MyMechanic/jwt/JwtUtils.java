package com.mechtech.MyMechanic.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

@Slf4j
@Component
public class JwtUtils {

    public static final String JWT_BEARER = "Bearer ";
    public static final String JWT_AUTHORIZATION = "Authorization";

    @Value("${jwt.secret.key}")
    private String secretKey;

    public static final long EXPIRE_DAYS = 1;
    public static final long EXPIRE_HOURS = 0;
    public static final long EXPIRE_MINUTES = 30;

    private Key generateKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    private Date toExpireDate(Date start) {
        LocalDateTime dateTime = start.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        LocalDateTime end = dateTime.plusDays(EXPIRE_DAYS)
                .plusHours(EXPIRE_HOURS)
                .plusMinutes(EXPIRE_MINUTES);
        return Date.from(end.atZone(ZoneId.systemDefault()).toInstant());
    }

    public JwtToken createToken(String username, String role, String tenantId) {
        Date issueDate = new Date();
        Date limit = toExpireDate(issueDate);

        String token = Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setSubject(username)
                .setIssuedAt(issueDate)
                .setExpiration(limit)
                .signWith(generateKey(), SignatureAlgorithm.HS256)
                .addClaims(Map.of("role", role))
                .addClaims(Map.of("tenant", tenantId))
                .compact();
        return new JwtToken(token);
    }

    private Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(generateKey())
                    .build()
                    .parseClaimsJws(refactorToken(token))
                    .getBody();
        } catch (JwtException e) {
            log.error(String.format("Invalid JWT token: %s", e.getMessage()));
        }
        return null;
    }

    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        if (claims != null) {
            return claims.getSubject();
        }
        return null;
    }

    public String getTenantFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims != null ? claims.get("tenant", String.class) : null;
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(generateKey())
                    .build()
                    .parseClaimsJws(refactorToken(token));
            return true;
        } catch (JwtException e) {
            log.error(String.format("Invalid JWT token: %s", e.getMessage()));
        }
        return false;
    }

    private String refactorToken(String token) {
        if (token != null && token.startsWith(JWT_BEARER)) {
            return token.substring(JWT_BEARER.length());
        }
        return token;
    }
}