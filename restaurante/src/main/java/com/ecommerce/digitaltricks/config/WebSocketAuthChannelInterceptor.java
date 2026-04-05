package com.ecommerce.digitaltricks.config;

import com.ecommerce.digitaltricks.shared.security.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthChannelInterceptor(
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService
    ) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authHeaders = accessor.getNativeHeader("Authorization");

            if (authHeaders == null || authHeaders.isEmpty()) {
                throw new IllegalArgumentException("Token não enviado no WebSocket.");
            }

            String authHeader = authHeaders.get(0);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Token inválido no WebSocket.");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.validateToken(token)) {
                throw new IllegalArgumentException("Token expirado ou inválido no WebSocket.");
            }

            String username = jwtUtil.extractUsername(token);
            System.out.println("WS autenticado como: " + username);

            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException("Usuário inválido no token do WebSocket.");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails.getUsername(), // 🔥 aqui
                            null,
                            userDetails.getAuthorities()
                    );
            accessor.setUser(authentication);
        }

        return message;
    }
}