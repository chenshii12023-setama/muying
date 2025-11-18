package com.mombaby.dto;

import com.mombaby.entity.AiChatRecord;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * AI问答请求DTO
 */
@Data
public class AiChatRequestDTO {

    @NotBlank(message = "问题不能为空")
    private String question;

    @NotBlank(message = "问题类型不能为空")
    private AiChatRecord.QuestionType questionType;

    private Long babyId;

}