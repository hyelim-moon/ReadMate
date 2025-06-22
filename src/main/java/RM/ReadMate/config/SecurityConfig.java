package RM.ReadMate.config;

import RM.ReadMate.security.JwtAuthenticationFilter;
import RM.ReadMate.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig
    ) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of("http://localhost:3000"));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()

                        // ✅ 공개 API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/community/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/community/**").authenticated()
                        .requestMatchers("/api/users/ranking").permitAll()
                        .requestMatchers("/api/books/**").permitAll()
                        .requestMatchers("/api/recommend").permitAll() // 🔥 추가됨
                        .requestMatchers("/api/recommend/**").permitAll()
                        .requestMatchers("/api/books/recommend/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers("/api/gemini/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/products/**").permitAll()

                        // ✅ 기록 조회는 GET만 허용
                        .requestMatchers(HttpMethod.GET, "/api/records/**").permitAll()

                        // ✅ 찜 관련 요청은 인증 필요 (check 포함!)
                        .requestMatchers(HttpMethod.GET, "/api/wishlist/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/wishlist/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/wishlist/**").authenticated()

                        // ✅ 인증 필요한 API들
                        .requestMatchers(HttpMethod.POST, "/api/records/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/records/**").authenticated()
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/users/award-points").authenticated()
                        .requestMatchers("/api/points/purchase").authenticated()
                        .requestMatchers("/api/users/purchases").authenticated()
                        .requestMatchers("/api/points/**").authenticated()
                        .requestMatchers("/api/saved-books/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/books/**").authenticated()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
