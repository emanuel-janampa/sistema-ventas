package com.ventas.api_gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    // 🔐 Obtener clave de firma
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // 🔍 Extraer todos los claims
    public Claims getClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 🔍 Extraer username
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // 🔍 Extraer role
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // ⏰ Verificar expiración
    public boolean isTokenExpired(String token) {

        return getClaims(token)
                .getExpiration()
                .before(new Date());
    }

    // ✅ Validar token
    public boolean validateToken(String token) {

        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}