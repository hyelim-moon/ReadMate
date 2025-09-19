package RM.ReadMate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Value("${aladin.base-url:https://www.aladin.co.kr/ttb/api/ItemList.aspx}")
    private String aladinBaseUrl;

    @Value("${googlebooks.base-url:https://www.googleapis.com/books/v1/volumes}")
    private String googleBaseUrl;

    @Bean
    public WebClient aladinClient(
            @Value("${spring.codec.max-in-memory-size:10MB}") DataSize maxInMemory
    ) {
        return WebClient.builder()
                .baseUrl(aladinBaseUrl)
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create()))
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize((int) maxInMemory.toBytes()))
                        .build())
                .build();
    }

    @Bean
    public WebClient googleBooksClient(
            @Value("${spring.codec.max-in-memory-size:10MB}") DataSize maxInMemory
    ) {
        return WebClient.builder()
                .baseUrl(googleBaseUrl)
                .clientConnector(new ReactorClientHttpConnector(HttpClient.create()))
                .exchangeStrategies(ExchangeStrategies.builder()
                        .codecs(c -> c.defaultCodecs().maxInMemorySize((int) maxInMemory.toBytes()))
                        .build())
                .build();
    }
}
