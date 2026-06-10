package com.ventas.api_gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(CorrelationIdFilter.class);
    public static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        HttpHeaders headers = exchange.getRequest().getHeaders();
        String traceId;

        if (headers.containsKey(TRACE_ID_HEADER)) {
            traceId = headers.getFirst(TRACE_ID_HEADER);
            log.info("[TRACE] ID existente detectado: {}", traceId);
        } else {
            traceId = UUID.randomUUID().toString();
            log.info("[TRACE] Nuevo Trace ID generado: {}", traceId);
        }

        ServerHttpRequest mutatedRequest = exchange.getRequest()
                .mutate()
                .header(TRACE_ID_HEADER, traceId)
                .build();

        exchange.getResponse()
                .getHeaders()
                .add(TRACE_ID_HEADER, traceId);

        return chain.filter(
                exchange.mutate()
                        .request(mutatedRequest)
                        .build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}