package RM.ReadMate.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3001")  // 허용할 origin
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")         // 허용할 HTTP 메서드
                .allowCredentials(true);                                           // 인증 정보 포함 허용 (ex. 쿠키)
    }
}
