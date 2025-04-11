package RM.ReadMate.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BannerController {
    @GetMapping("/banner")
    public String getBannerMessage() {
        return "오늘도 좋은 책 한 권 어떠세요?";
    }
}
