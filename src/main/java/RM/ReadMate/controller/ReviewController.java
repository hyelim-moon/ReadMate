package RM.ReadMate.controller;

import RM.ReadMate.dto.ReportRequestDto;
import RM.ReadMate.dto.ReviewDto;
import RM.ReadMate.service.ReportService;
import RM.ReadMate.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReportService reportService; // ReportService 주입

    @PostMapping("/reviews")
    public ReviewDto addReview(@AuthenticationPrincipal UserDetails user, @RequestBody ReviewDto reviewDto) {
        return reviewService.addReview(reviewDto.getBookId(), user.getUsername(), reviewDto.getContent(), reviewDto.getRating());
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId, @AuthenticationPrincipal UserDetails user) {
        reviewService.deleteReview(reviewId, user.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reviews/{reviewId}/report")
    public ResponseEntity<Void> reportReview(@PathVariable Long reviewId,
                                             @AuthenticationPrincipal UserDetails user,
                                             @RequestBody ReportRequestDto reportRequestDto) {
        reportService.reportReview(reviewId, user.getUsername(), reportRequestDto.getReason());
        return ResponseEntity.ok().build();
    }
}
