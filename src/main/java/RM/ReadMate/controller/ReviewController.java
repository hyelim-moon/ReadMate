package RM.ReadMate.controller;

import RM.ReadMate.dto.ReviewDto;
import RM.ReadMate.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    public ReviewDto addReview(@AuthenticationPrincipal UserDetails user, @RequestBody ReviewDto reviewDto) {
        return reviewService.addReview(reviewDto.getBookId(), user.getUsername(), reviewDto.getContent(), reviewDto.getRating());
    }
}