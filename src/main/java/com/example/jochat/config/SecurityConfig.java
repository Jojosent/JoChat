package com.example.jochat.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:5173"));
            config.setAllowedMethods(List.of("*")); // Разрешаем все методы
            config.setAllowedHeaders(List.of("*")); // Разрешаем все заголовки
            return config;
        }))
                .authorizeHttpRequests(auth -> auth
                // 1. ЖЕЛЕЗОБЕТОННО ПРОПУСКАЕМ ВСЕ ПРОВЕРОЧНЫЕ ЗАПРОСЫ БРАУЗЕРА
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 2. Наши открытые эндпоинты
                // .requestMatchers("/api/auth/**", "/api/user/**").permitAll()
                // Измените эту строку в authorizeHttpRequests:
                .requestMatchers("/api/auth/**", "/api/user/**", "/uploads/**", "/error", "/api/chat/**", "/api/groups/**").permitAll() // 3. Все остальное закрыто
                .requestMatchers("/api/auth/**", "/api/user/**", "/uploads/**", "/error", "/api/chat/**", "/api/groups/**").permitAll() // 3. Все остальное закрыто
                .anyRequest().authenticated()
                );
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        StrictHttpFirewall firewall = new StrictHttpFirewall();
        // Разрешаем символы, которые часто встречаются в URL картинок
        firewall.setAllowUrlEncodedSlash(true);
        firewall.setAllowSemicolon(true);
        firewall.setAllowBackSlash(true);
        firewall.setAllowUrlEncodedPercent(true);
        return firewall;
    }
}
