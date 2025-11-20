package RM.ReadMate.service;

import RM.ReadMate.entity.Book;
import RM.ReadMate.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 기존 DB 에서 genre가 "소설"인 도서들을
 * 고전소설 / 영미소설 / 한국소설 / 소설 로 재분류합니다.
 * application.yml 에서 readmate.novel-reclassify.enabled=true 로 켜면 동작합니다.
 */
@Component
@RequiredArgsConstructor
public class NovelSubgenreReclassificationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(NovelSubgenreReclassificationRunner.class);

    private final BookRepository bookRepository;

    @Value("${readmate.novel-reclassify.enabled:false}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("[NovelReclassify] disabled (readmate.novel-reclassify.enabled=false)");
            return;
        }

        List<Book> novels = bookRepository.findByGenre("소설");
        int updated = 0;

        for (Book b : novels) {
            String sub = NovelSubgenreClassifier.classify(b);
            if (sub != null && !sub.isBlank() && !sub.equals(b.getGenre())) {
                b.setGenre(sub);
                updated++;
            }
        }
        log.info("[NovelReclassify] 완료: {}권 업데이트", updated);
    }
}
