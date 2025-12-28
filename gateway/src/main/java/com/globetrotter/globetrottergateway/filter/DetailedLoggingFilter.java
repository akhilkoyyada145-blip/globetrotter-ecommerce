package com.globetrotter.globetrottergateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class DetailedLoggingFilter extends AbstractGatewayFilterFactory<DetailedLoggingFilter.Config> {

    public DetailedLoggingFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (config.isLogHeaders()) {
                log.debug("📋 REQUEST HEADERS:");
                HttpHeaders headers = request.getHeaders();
                headers.forEach((name, values) -> {
                    // Don't log sensitive headers
                    if (!name.equalsIgnoreCase("Authorization") &&
                            !name.equalsIgnoreCase("Cookie")) {
                        log.debug("   {}: {}", name, values);
                    } else {
                        log.debug("   {}: [REDACTED]", name);
                    }
                });
            }

            if (config.isLogQueryParams()) {
                if (!request.getURI().getQuery().isEmpty()) {
                    log.debug("🔍 QUERY PARAMS: {}", request.getURI().getQuery());
                }
            }

            return chain.filter(exchange);
        };
    }

    public static class Config {
        private boolean logHeaders = true;
        private boolean logQueryParams = true;

        public boolean isLogHeaders() {
            return logHeaders;
        }

        public void setLogHeaders(boolean logHeaders) {
            this.logHeaders = logHeaders;
        }

        public boolean isLogQueryParams() {
            return logQueryParams;
        }

        public void setLogQueryParams(boolean logQueryParams) {
            this.logQueryParams = logQueryParams;
        }
    }
}