package com.ventas.api_gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

        private static final Logger log = LoggerFactory.getLogger(LoggingGlobalFilter.class);

        @Override
        public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

                long startTime = System.currentTimeMillis();

                String traceId = exchange.getRequest()
                                .getHeaders()
                                .getFirst(CorrelationIdFilter.TRACE_ID_HEADER);

                String method = exchange.getRequest()
                                .getMethod()
                                .name();

                String path = exchange.getRequest()
                                .getURI()
                                .getPath();

                log.info("""
                                ================= REQUEST =================
                                TraceId : {}
                                Method  : {}
                                Path    : {}
                                ===========================================
                                """,
                                traceId,
                                method,
                                path);

                // --- SOLUCIÓN AQUÍ ---
                // Registramos la mutación del header de respuesta de forma segura antes de que
                // Netty cierre el canal
                exchange.getResponse().beforeCommit(() -> {
                        long duration = System.currentTimeMillis() - startTime;
                        if (!exchange.getResponse().getHeaders().containsKey("X-Response-Time")) {
                                exchange.getResponse().getHeaders().add("X-Response-Time", duration + " ms");
                        }
                        return Mono.empty();
                });

                return chain.filter(exchange)
                                .then(Mono.fromRunnable(() -> {
                                        long duration = System.currentTimeMillis() - startTime;
                                        HttpStatusCode status = exchange.getResponse().getStatusCode();

                                        log.info("""
                                                        ================= RESPONSE ================
                                                        TraceId : {}
                                                        Status  : {}
                                                        Time    : {} ms
                                                        ===========================================
                                                        """,
                                                        traceId,
                                                        status,
                                                        duration);
                                }));
        }

        @Override
        public int getOrder() {
                return Ordered.HIGHEST_PRECEDENCE + 1;
        }
}