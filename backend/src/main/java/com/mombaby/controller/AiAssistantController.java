package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.dto.AiChatRequestDTO;
import com.mombaby.entity.AiChatRecord;
import com.mombaby.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * AI助手控制器
 */
@RestController
@RequestMapping("/ai-assistant")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    /**
     * AI问答
     */
    @PostMapping("/chat")
    public Result<AiChatRecord> chat(@Valid @RequestBody AiChatRequestDTO request, 
                                      Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            
            // 生成AI回答
            String answer = aiAssistantService.generateAiAnswer(
                    request.getQuestion(), request.getQuestionType());

            // 保存聊天记录
            AiChatRecord record = aiAssistantService.saveChatRecord(
                    userId, request.getBabyId(), request.getQuestion(), 
                    request.getQuestionType(), answer);

            return Result.success("AI回答生成成功", record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户的聊天记录
     */
    @GetMapping("/chat-records")
    public Result<List<AiChatRecord>> getChatRecords(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<AiChatRecord> records = aiAssistantService.getUserChatRecords(userId);
            return Result.success(records);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取宝宝的聊天记录
     */
    @GetMapping("/chat-records/baby/{babyId}")
    public Result<List<AiChatRecord>> getBabyChatRecords(@PathVariable Long babyId,
                                                     Authentication authentication) {
        try {
            // 这里需要验证宝宝属于当前用户
            List<AiChatRecord> records = aiAssistantService.getBabyChatRecords(babyId);
            return Result.success(records);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新问答有帮助评价
     */
    @PostMapping("/chat-records/{recordId}/helpful")
    public Result<Void> updateHelpfulness(@PathVariable Long recordId,
                                        @RequestParam Boolean helpful,
                                        Authentication authentication) {
        try {
            // 这里需要验证记录属于当前用户
            aiAssistantService.updateChatRecordHelpfulness(recordId, helpful);
            return Result.success("评价更新成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        // 这里应该从JWT token中解析用户ID
        // 暂时返回1L，实际项目中需要实现
        return 1L;
    }

}