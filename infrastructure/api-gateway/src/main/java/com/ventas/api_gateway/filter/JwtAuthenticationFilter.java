package com.ventas.api_gateway.filter;

import com.ventas.api_gateway.config.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    public static class Config {
        // Clase requerida por la factoría de filtros de Spring Cloud Gateway
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            ServerHttpRequest request = exchange.getRequest();

            // 1. Validar si viene el header Authorization
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Acceso denegado: Falta el Token de Autorización en la petición.",
                        HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getOrEmpty(HttpHeaders.AUTHORIZATION).get(0);

            // 2. Validar el formato "Bearer "
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange,
                        "Acceso denegado: El formato del token enviado no es válido (Debe iniciar con Bearer).",
                        HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // 3. Validar la firma y expiración
            if (!jwtUtil.validateToken(token)) {
                return onError(exchange, "Acceso denegado: El Token proporcionado es inválido o ya ha expirado.",
                        HttpStatus.UNAUTHORIZED);
            }

            // 🔒 4. CONTROL INTELIGENTE DE ROLES
            Claims claims = jwtUtil.getClaims(token);

            String role = claims.get("role", String.class);
            String method = request.getMethod().name();

            if ((method.equals("POST")
                    || method.equals("PUT")
                    || method.equals("DELETE"))
                    && !role.equalsIgnoreCase("ADMIN")) {

                return onError(
                        exchange,
                        "Permiso denegado: Se requieren privilegios de ADMINISTRADOR para realizar operaciones de escritura.",
                        HttpStatus.FORBIDDEN);
            }

            // 5. Mutar la petición inyectando Claims en los headers para el consumo interno
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Username", claims.getSubject())
                    .header("X-User-Role", role)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    // 🎯 NUEVO MÉTODO DE ERROR: Devuelve un JSON limpio y formateado en Postman
    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Generamos la estructura JSON para la respuesta
        String jsonBody = String.format(
                "{\n  \"timestamp\": \"%s\",\n  \"status\": %d,\n  \"error\": \"%s\",\n  \"message\": \"%s\"\n}",
                java.time.Instant.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message);

        DataBuffer buffer = response.bufferFactory().wrap(jsonBody.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
}