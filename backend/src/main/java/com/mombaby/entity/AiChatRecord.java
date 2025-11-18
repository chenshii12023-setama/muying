package com.mombaby.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * AI问答记录实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "ai_chat_records")
public class AiChatRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "baby_id")
    private Baby baby;

    @Column(name = "question", nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(name = "answer", columnDefinition = "TEXT")
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", length = 50)
    private QuestionType questionType;

    @Column(name = "is_helpful")
    private Boolean isHelpful;

    public enum QuestionType {
        FEEDING("feeding", "喂养"),
        SLEEP("sleep", "睡眠"),
        HEALTH("health", "健康"),
        DEVELOPMENT("development", "发育"),
        BEHAVIOR("behavior", "行为"),
        OTHER("other", "其他");

        private final String code;
        private final String description;

        QuestionType(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

}