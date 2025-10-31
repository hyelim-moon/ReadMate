
import React, { useState } from 'react';
import styles from '../../assets/styles/Help.module.css';

const faqData = [
    {
        category: '챌린지',
        questions: [
            {
                q: '챌린지는 어떻게 참여하나요?',
                a: "챌린지 페이지에서 '참여 가능' 상태인 챌린지를 선택하고 '참여하기' 버튼을 누르면 참여가 완료됩니다. 로그인이 필요한 서비스입니다.",
            },
            {
                q: '챌린지 진행 상황은 어디서 확인하나요?',
                a: "챌린지 상세 페이지의 '진행상황' 탭 또는 '마이페이지'에서 현재 참여 중인 챌린지의 진행률을 확인할 수 있습니다.",
            },
            {
                q: '챌린지 보상은 언제 지급되나요?',
                a: '챌린지 보상으로 지급되는 포인트는 챌린지 기간이 종료된 후 자동으로 지급됩니다. 지급 내역은 마이페이지의 포인트 내역에서 확인할 수 있습니다.',
            },
        ],
    },
    {
        category: '포인트',
        questions: [
            {
                q: '포인트는 어떻게 얻을 수 있나요?',
                a: '포인트는 챌린지 성공 보상, 독서 기록 작성, 이벤트 참여 등 다양한 활동을 통해 얻을 수 있습니다.',
            },
            {
                q: '포인트는 어디에 사용할 수 있나요?',
                a: "'포인트 상점'에서 다양한 상품으로 교환할 수 있습니다. 갖고 싶은 상품을 둘러보고 독서 활동으로 모은 포인트로 구매해보세요.",
            },
        ],
    },
    {
        category: '독서 기록',
        questions: [
            {
                q: '독서 기록은 어떻게 작성하나요?',
                a: "메인 페이지 또는 '독서 기록' 페이지에서 '기록 추가' 버튼을 눌러 작성할 수 있습니다. 책 정보, 독서 기간, 감상 등을 자유롭게 기록해보세요.",
            },
            {
                q: '비공개로 독서 기록을 작성할 수 있나요?',
                a: "네, 가능합니다. 독서 기록 작성 시 '공개 설정' 옵션을 '비공개'로 선택하면 다른 사용자에게 노출되지 않습니다. 단, 비공개 기록은 챌린지 진행률에 포함되지 않으니 유의해주세요.",
            },
        ],
    },
];

const FaqItem = ({ item, isOpen, onClick }) => {
    return (
        <div className={styles.faqItem}>
            <div className={styles.faqQuestion} onClick={onClick} role="button" tabIndex={0}>
                <span>{item.q}</span>
                <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>▼</span>
            </div>
            {isOpen && (
                <div className={styles.faqAnswer}>
                    <p>{item.a}</p>
                </div>
            )}
        </div>
    );
};

const Help = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const handleItemClick = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className={styles.helpPage}>
            <div className={styles.headerContainer}>
                <h1 className={styles.pageTitle}>도움말</h1>
            </div>
            <div className={styles.helpContent}>
                <p className={styles.introText}>
                    Readmate 사용에 대해 궁금한 점이 있으신가요? <br />
                    자주 묻는 질문을 통해 궁금증을 해결해 보세요.
                </p>
                {faqData.map((section, sectionIndex) => (
                    <div key={sectionIndex} className={styles.faqSection}>
                        <h2 className={styles.sectionTitle}>{section.category}</h2>
                        {section.questions.map((item, itemIndex) => {
                            const globalIndex = section.questions.slice(0, itemIndex).reduce((acc, q) => acc + 1, sectionIndex * 1000);
                            return(
                                <FaqItem
                                    key={globalIndex}
                                    item={item}
                                    isOpen={openIndex === globalIndex}
                                    onClick={() => handleItemClick(globalIndex)}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Help;
