package RM.ReadMate.service;

import RM.ReadMate.entity.Report;
import RM.ReadMate.entity.Review;
import RM.ReadMate.entity.User;
import RM.ReadMate.repository.ReportRepository;
import RM.ReadMate.repository.ReviewRepository;
import RM.ReadMate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public Report reportReview(Long reviewId, String reporterUsername, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + reviewId));

        User reporter = userRepository.findByUserid(reporterUsername)
                .orElseThrow(() -> new IllegalArgumentException("Reporter user not found with username: " + reporterUsername));

        Report report = new Report();
        report.setReview(review);
        report.setReporter(reporter);
        report.setReason(reason);
        report.setStatus(Report.ReportStatus.PENDING); // 초기 상태는 PENDING

        return reportRepository.save(report);
    }
}
