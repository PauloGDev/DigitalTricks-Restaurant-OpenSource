package com.ecommerce.digitaltricks.config;

import com.ecommerce.digitaltricks.shared.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // autenticação / integrações públicas
                        .requestMatchers(
                                "/api/clientes/auth/**",
                                "/api/mercadopago/webhook",
                                "/api/webhooks/mercadopago/**",
                                "/api/melhorenvio/**",
                                "/api/mercadopago/**",
                                "/api/empresas/mp/callback"
                        ).permitAll()

                        .requestMatchers("/ws", "/ws/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()

                        // checkout legado, se ainda existir
                        .requestMatchers(HttpMethod.POST, "/api/checkout").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/checkout/**").permitAll()

                        // =========================
                        // PÚBLICO NOVO POR SLUG
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/public/restaurantes/**").permitAll()

                        // =========================
                        // PÚBLICO LEGADO POR EMPRESA_ID
                        // (mantenha só se ainda estiver usando)
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/public/empresas/**").permitAll()

                        // =========================
                        // CARRINHO DO CLIENTE POR SLUG
                        // =========================
                        .requestMatchers("/api/restaurantes/*/carrinho/**").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/restaurantes/{slug}/carrinho/cupom/aplicar").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/restaurantes/{slug}/carrinho/cupom/remover").authenticated()
                        .requestMatchers("/api/restaurantes/{slug}/carrinho/**").authenticated()

                        // =========================
                        // PAGAMENTOS DO CLIENTE
                        // =========================
                        .requestMatchers("/api/pagamentos/**").hasAnyRole("CLIENTE", "ADMIN")

                        // Chave pública MP (deve vir ANTES de /api/empresas/** com ADMIN sozinha)
                        .requestMatchers(HttpMethod.GET, "/api/empresas/*/mp/public-key").hasAnyRole("CLIENTE", "ADMIN")

                        // =========================
                        // PEDIDO DO CLIENTE POR SLUG
                        // =========================
                        .requestMatchers(HttpMethod.POST, "/api/restaurantes/*/pedidos").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/restaurantes/*/pedidos/me").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/restaurantes/*/pedidos/fidelidade").hasAnyRole("CLIENTE", "ADMIN")

                        // =========================
                        // PEDIDOS DO USUÁRIO
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/me").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/*").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/*/status").hasAnyRole("CLIENTE", "ADMIN")

                        // este endpoint NÃO é público de verdade, pois valida usuário autenticado
                        .requestMatchers(HttpMethod.GET, "/api/pedidos/public/**").hasAnyRole("CLIENTE", "ADMIN")

                        // criação legado por empresaId/body, se ainda existir
                        .requestMatchers(HttpMethod.POST, "/api/pedidos/criar").hasAnyRole("CLIENTE", "ADMIN")

                        // =========================
                        // PERFIL / ENDEREÇOS / USUÁRIO LOGADO
                        // =========================
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/clientes/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/clientes/me").authenticated()
                        .requestMatchers("/api/enderecos/me/**").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers("/api/perfis/me/**").hasAnyRole("CLIENTE", "ADMIN")
                        .requestMatchers("/api/payment/**").hasAnyRole("CLIENTE", "ADMIN")

                        // =========================
                        // ÁREA PRIVADA DA EMPRESA
                        // =========================
                        .requestMatchers("/api/empresas/**").hasRole("ADMIN")
                        .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/categorias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/produtos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/produtos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/produtos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/perfis/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}