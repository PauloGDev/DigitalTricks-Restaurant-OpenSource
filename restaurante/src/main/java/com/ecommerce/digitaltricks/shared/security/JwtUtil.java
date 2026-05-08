package com.ecommerce.digitaltricks.shared.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Set;

@Component
/**
 * Encapsula a emissao e leitura dos tokens JWT usados pela API.
 *
 * <p>O backend usa um unico segredo para tokens de cliente e de area
 * administrativa. As claims variam conforme o tipo de autenticacao.</p>
 */
public class JwtUtil {

    private final SecretKey secretKey;

    // Mantem um tempo unico para simplificar a validade no frontend e no backend.
    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(Long id, String username, Set<String> roles, Long empresaId) {
        // Token da equipe interna. Carrega empresaId para facilitar as regras
        // de acesso ligadas ao restaurante atual.
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
        // Token do cliente final. Aqui o subject e o telefone porque ele e a
        // principal chave de login no fluxo publico.
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
