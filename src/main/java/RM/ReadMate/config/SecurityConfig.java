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
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH","HEAD"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization","Location"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
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
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/h2-console/**", "/error", "/uploads/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/gemini/**").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/users/ranking").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers("/api/recommend/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/records/**").permitAll()
                        .requestMatchers("/api/community/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/challenges/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/team-challenges/**").permitAll() // 팀 챌린지 목록 조회는 permitAll
                        .requestMatchers(HttpMethod.GET, "/api/team-challenges/{teamChallengeId}").permitAll() // 팀 챌린지 상세 조회는 permitAll
                        .requestMatchers("/api/search/**").permitAll()


                        // ✅ 새로 추가: 책 메타데이터 백필용 엔드포인트는 개발 편의를 위해 permitAll
                        //  (운영 환경에서는 토큰 인증을 요구하거나, admin 전용으로 바꾸는 것을 권장)
                        .requestMatchers(HttpMethod.POST, "/api/books/enrich-missing").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/books/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/records/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/records/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/challenges/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/team-challenges/{teamChallengeId}/join").authenticated() // 팀 챌린지 참여는 인증 필요
                        .requestMatchers(HttpMethod.PUT, "/api/team-challenges/{teamChallengeId}").authenticated() // 팀 챌린지 수정은 인증 필요
                        .requestMatchers(HttpMethod.DELETE, "/api/team-challenges/{teamChallengeId}").authenticated() // 팀 챌린지 삭제는 인증 필요
                        .requestMatchers("/api/users/me").authenticated()
                        .requestMatchers("/api/users/award-points").authenticated()
                        .requestMatchers("/api/points/**").authenticated()
                        .requestMatchers("/api/saved-books/**").authenticated()
                        .requestMatchers("/api/wishlist/**").authenticated()

                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
