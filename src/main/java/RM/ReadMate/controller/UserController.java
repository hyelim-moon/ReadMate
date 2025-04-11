package RM.ReadMate.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {
    @GetMapping("/user/info")
    public Map<String, String> getUserInfo() {
        return Map.of("username", "booklover_91");
    }
}
