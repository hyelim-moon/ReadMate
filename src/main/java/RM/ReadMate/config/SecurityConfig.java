package RM.ReadMate.config;

import RM.ReadMate.security.JwtAuthenticationFilter;
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
                // ✅ CORS 설정
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of(
                            "http://localhost:3000",
                            "http://localhost:3001",
                            "http://localhost:3002",
                            "http://localhost:5173"
                    ));
                    config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH","HEAD"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ✅ 인증 없는 사용자도 접근 가능하도록 설정
                .anonymous(Customizer.withDefaults())
                .exceptionHandling(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth
                        // Preflight 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ✅ 공개 API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/gemini/**").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/users/ranking").permitAll()

                        // ✅ 책 관련 GET 요청은 전부 공개
                        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers("/api/recommend/**").permitAll()

                        // ✅ 기록 조회(GET) 공개
                        .requestMatchers(HttpMethod.GET, "/api/records/**").permitAll()

                        // 🔒 인증 필요한 API
                        .requestMatchers(HttpMethod.POST, "/api/books/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/records/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/records/**").authenticated()
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/users/award-points").authenticated()
                        .requestMatchers("/api/points/**").authenticated()
                        .requestMatchers("/api/saved-books/**").authenticated()
                        .requestMatchers("/api/wishlist/**").authenticated()

                        // 나머지 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // ✅ JWT 필터 등록
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
