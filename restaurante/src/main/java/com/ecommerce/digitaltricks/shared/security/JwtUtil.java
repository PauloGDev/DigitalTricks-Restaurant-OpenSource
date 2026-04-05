package com.ecommerce.digitaltricks.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Set;

@Component
public class JwtUtil {

    private final SecretKey secretKey;

    // 24h
    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(Long id, String username, Set<String> roles, Long empresaId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("roles", roles)
                .claim("empresaId", empresaId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateClienteToken(Long clienteId, String telefone) {
        return Jwts.builder()
                .setSubject(telefone)
                .claim("id", clienteId)
                .claim("clienteId", clienteId)
                .claim("type", "CLIENTE")
                .claim("roles", Set.of("ROLE_USER"))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractAllClaims(token).get("id", Long.class);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (ExpiredJwtException e) {
            System.out.println("❌ Token expirado");
        } catch (UnsupportedJwtException e) {
            System.out.println("❌ Token não suportado");
        } catch (MalformedJwtException e) {
            System.out.println("❌ Token malformado");
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.out.println("❌ Assinatura inválida");
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Token vazio ou inválido");
        } catch (Exception e) {
            System.out.println("❌ Falha ao validar token: " + e.getMessage());
        }
        return false;
    }
}