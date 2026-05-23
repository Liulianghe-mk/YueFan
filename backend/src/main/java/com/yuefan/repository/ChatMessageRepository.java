package com.yuefan.repository;

import com.yuefan.domain.ChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findAllByConversationIdOrderByIdAsc(long conversationId);

    void deleteAllByConversationId(long conversationId);
}
