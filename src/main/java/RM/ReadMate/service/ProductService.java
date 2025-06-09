package RM.ReadMate.service;

import RM.ReadMate.entity.Product;
import RM.ReadMate.repository.ProductRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository){
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts(){
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.orElse(null);
    }

    // 교보 크롤링 메서드
    public List<Map<String, String>> kyoboGiftCards() throws IOException {
        String url = "https://www.kyobobook.co.kr/gift";
        Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                        "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
                .timeout(10000)
                .get();

        // 교보문고 기프트카드 페이지 구조에 맞춘 선택자
        Elements giftCards = doc.select("ul > li");

        List<Map<String, String>> products = new ArrayList<>();

        for (Element card : giftCards) {
            Element img = card.selectFirst("a > div > img");
            Element nameAnchor = card.selectFirst("a.fz-16.mb-1.hover\\:underline.block.font-medium");
            Element priceStrong = card.selectFirst("p > strong");

            if (img != null && nameAnchor != null && priceStrong != null) {
                String name = nameAnchor.text().trim();
                String image = img.attr("src").trim();
                String price = priceStrong.text().trim().replaceAll("[^0-9]", "");

                if (!image.startsWith("http")) {
                    image = "https://www.kyobobook.co.kr" + image;
                }

                products.add(Map.of(
                        "name", name,
                        "image", image,
                        "price", price
                ));
            }
        }

        return products;
    }
}
