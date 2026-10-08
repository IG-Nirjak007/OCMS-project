package com.ocms.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${ocms.app.jwtSecret:DefaultSecretKeyForJwtTokenGenerationMustBeLongEnough123456789}")
    private String jwtSecret;

    @Value("${ocms.app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateJwtToken(Authentication authentication) {
        String username = authentication.getName();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateResetToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("purpose", "password_reset")
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + 15 * 60 * 1000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateResetToken(String resetToken, String email) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(resetToken)
                    .getBody();

            String tokenEmail = claims.getSubject();
            String purpose = claims.get("purpose", String.class);

            return email.equals(tokenEmail) && "password_reset".equals(purpose);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Handles lowercase 'n' method call matching line 34 in JwtAuthenticationFilter
    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Alias to prevent breaking other controllers calling getUserNameFromJwtToken
    public String getUserNameFromJwtToken(String token) {
        return getUsernameFromJwtToken(token);
    }
}