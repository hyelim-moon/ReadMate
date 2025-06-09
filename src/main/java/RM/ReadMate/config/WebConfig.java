    package RM.ReadMate.config;

    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.servlet.config.annotation.CorsRegistry;
    import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
    import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

    @Configuration
    public class WebConfig implements WebMvcConfigurer {

        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowCredentials(true);
        }

        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            // 정적 파일 (업로드 이미지 등) 제공
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
        }
    }
