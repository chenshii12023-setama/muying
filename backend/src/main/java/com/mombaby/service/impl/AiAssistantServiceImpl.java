package com.mombaby.service.impl;

import com.mombaby.entity.AiChatRecord;
import com.mombaby.entity.Baby;
import com.mombaby.entity.User;
import com.mombaby.repository.BabyRepository;
import com.mombaby.repository.UserRepository;
import com.mombaby.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI助手服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AiAssistantServiceImpl implements AiAssistantService {

    private final UserRepository userRepository;
    private final BabyRepository babyRepository;
    private final JpaRepository<AiChatRecord, Long> chatRecordRepository; // 需要创建对应的Repository

    @Override
    public AiChatRecord saveChatRecord(@NonNull Long userId, Long babyId, String question, 
                                      AiChatRecord.QuestionType questionType, String answer) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Baby baby = null;
        if (babyId != null) {
            baby = babyRepository.findById(babyId)
                    .orElseThrow(() -> new RuntimeException("宝宝档案不存在"));
        }

        AiChatRecord record = new AiChatRecord();
        record.setUser(user);
        record.setBaby(baby);
        record.setQuestion(question);
        record.setAnswer(answer);
        record.setQuestionType(questionType);
        record.setIsHelpful(null);

        return chatRecordRepository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiChatRecord> getUserChatRecords(Long userId) {
        // 这里需要实现查询逻辑，暂时返回空列表
        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiChatRecord> getBabyChatRecords(Long babyId) {
        // 这里需要实现查询逻辑，暂时返回空列表
        return new ArrayList<>();
    }

    @Override
    public void updateChatRecordHelpfulness(@NonNull Long recordId, Boolean helpful) {
        AiChatRecord record = chatRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("聊天记录不存在"));
        
        record.setIsHelpful(helpful);
        chatRecordRepository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public String generateAiAnswer(String question, AiChatRecord.QuestionType questionType) {
        // 模拟AI回答，实际项目中应该调用真实的AI服务
        Map<String, String> answerTemplates = new HashMap<>();
        
        answerTemplates.put("FEEDING", "关于喂养问题，建议您：1) 按需喂养，观察宝宝的饥饿信号；2) 保持正确的喂养姿势；3) 注意拍嗝避免胀气。如需具体指导，请咨询专业医生。");
        answerTemplates.put("SLEEP", "关于睡眠问题，建议您：1) 建立规律的作息时间；2) 营造舒适的睡眠环境；3) 建立睡前仪式。持续影响睡眠质量时请咨询儿科医生。");
        answerTemplates.put("HEALTH", "关于健康问题，建议您：1) 定期测量体温；2) 观察精神状态；3) 注意饮食和水分补充。如有异常情况，请及时就医。");
        answerTemplates.put("DEVELOPMENT", "关于发育问题，每个宝宝的发展节奏都不同。建议您：1) 多与宝宝互动交流；2) 提供适龄的玩具；3) 鼓励宝宝探索。如有发育迟缓担心，请咨询儿科专家。");
        answerTemplates.put("BEHAVIOR", "关于行为问题，建议您：1) 理解宝宝的情绪表达；2) 保持耐心和理解；3) 建立清晰的界限。持续的行为问题可咨询儿童心理专家。");
        
        return answerTemplates.getOrDefault(questionType.getCode(), "感谢您的提问。为了给您更准确的建议，建议咨询相关专业医生或育儿专家。");
    }

}