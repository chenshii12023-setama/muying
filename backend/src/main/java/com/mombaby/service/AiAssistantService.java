package com.mombaby.service;

import com.mombaby.entity.AiChatRecord;

import java.util.List;

/**
 * AI助手服务接口
 */
public interface AiAssistantService {

    /**
     * 保存AI问答记录
     */
    AiChatRecord saveChatRecord(Long userId, Long babyId, String question, AiChatRecord.QuestionType questionType, String answer);

    /**
     * 获取用户的AI聊天记录
     */
    List<AiChatRecord> getUserChatRecords(Long userId);

    /**
     * 获取宝宝的AI聊天记录
     */
    List<AiChatRecord> getBabyChatRecords(Long babyId);

    /**
     * 更新问答是否有帮助
     */
    void updateChatRecordHelpfulness(Long recordId, Boolean helpful);

    /**
     * 模拟AI回答（实际项目中应该调用真实的AI服务）
     */
    String generateAiAnswer(String question, AiChatRecord.QuestionType questionType);

}