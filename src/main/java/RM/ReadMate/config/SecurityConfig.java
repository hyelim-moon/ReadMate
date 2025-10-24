package RM.ReadMate.config;

import RM.ReadMate.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
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
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // 포트가 바뀌어도 허용되도록 패턴 사용
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH","HEAD"));
        cfg.setAllowedHeaders(List.of("*"));         // Authorization, Content-Type 등 모두 허용
        cfg.setExposedHeaders(List.of("Authorization","Location")); // 필요 시 프론트에서 읽을 헤더
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CORS/CSRF/세션
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 기본 인증/폼 로그인 비활성 (JWT만 사용)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)

                // 인증 안 된 사용자 허용 + 예외를 JSON으로 응답
                .anonymous(Customizer.withDefaults())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"message\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"message\":\"Forbidden\"}");
                        })
                )

                // 인가 규칙
                .authorizeHttpRequests(auth -> auth
                        // Preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 개발 편의를 위한 콘솔/에러/정적 리소스
                        .requestMatchers("/h2-console/**", "/error", "/uploads/**").permitAll()

                        // 공개 API
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/gemini/**").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/users/ranking").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers("/api/recommend/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/records/**").permitAll()
                        .requestMatchers("/api/community/**").permitAll()

                        // 인증 필요 API
                        .requestMatchers(HttpMethod.POST, "/api/books/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/records/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/records/**").authenticated()
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/users/award-points").authenticated()
                        .requestMatchers("/api/points/**").authenticated()
                        .requestMatchers("/api/saved-books/**").authenticated()
                        .requestMatchers("/api/wishlist/**").authenticated()

                        // 나머지는 인증 필요
                        .anyRequest().authenticated()
                )

                // H2 콘솔 frame 허용(개발용)
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))

                // JWT 필터
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
