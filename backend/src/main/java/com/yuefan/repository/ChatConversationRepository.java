package com.yuefan.repository;

import com.yuefan.domain.ChatConversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Page<ChatConversation> findAllByOrderByUpdatedAtDesc(Pageable pageable);

    List<ChatConversation> findAllByUserOpenidOrderByUpdatedAtDesc(String userOpenid);

    Optional<ChatConversation> findByUserOpenidAndPeerKey(String userOpenid, String peerKey);

    long countByUserOpenid(String userOpenid);
}
