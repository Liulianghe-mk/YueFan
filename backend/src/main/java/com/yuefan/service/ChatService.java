package com.yuefan.service;

import com.yuefan.domain.ChatConversation;
import com.yuefan.domain.ChatMessage;
import com.yuefan.domain.ChatSenderType;
import com.yuefan.repository.ChatConversationRepository;
import com.yuefan.repository.ChatMessageRepository;
import com.yuefan.web.dto.ChatConversationEnsureRequest;
import com.yuefan.web.dto.ChatConversationResponse;
import com.yuefan.web.dto.ChatMessageResponse;
import com.yuefan.web.dto.ChatMessageSendRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {

    public static final String DEFAULT_USER_OPENID = "miniapp-user";

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;

    @Transactional(readOnly = true)
    public Page<ChatConversationResponse> listForAdmin(Pageable pageable) {
        return conversationRepository.findAllByOrderByUpdatedAtDesc(pageable).map(this::toConvResponse);
    }

    @Transactional(readOnly = true)
    public List<ChatConversationResponse> listForApp(String userOpenid) {
        return conversationRepository.findAllByUserOpenidOrderByUpdatedAtDesc(resolveUser(userOpenid)).stream()
                .map(this::toConvResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatConversationResponse getConversation(long id) {
        return toConvResponse(loadConversation(id));
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> listMessages(long conversationId) {
        loadConversation(conversationId);
        return messageRepository.findAllByConversationIdOrderByIdAsc(conversationId).stream()
                .map(this::toMsgResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> listMessagesForApp(long conversationId, String userOpenid) {
        ChatConversation conv = loadConversation(conversationId);
        assertUser(conv, userOpenid);
        return listMessages(conversationId);
    }

    @Transactional
    public ChatConversationResponse ensureConversation(String userOpenid, ChatConversationEnsureRequest req) {
        String user = resolveUser(userOpenid);
        String peerKey = peerKey(req.peerId(), req.peerName());
        ChatConversation conv =
                conversationRepository
                        .findByUserOpenidAndPeerKey(user, peerKey)
                        .orElseGet(
                                () -> {
                                    ChatConversation c = new ChatConversation();
                                    c.setUserOpenid(user);
                                    c.setPeerKey(peerKey);
                                    c.setPeerId(trim(req.peerId(), 32));
                                    c.setPeerName(trim(req.peerName(), 80));
                                    c.setPeerAvatarUrl(trimOrDefault(req.peerAvatarUrl(), 1024, ""));
                                    c.setContextLabel(trim(req.contextLabel(), 200));
                                    return conversationRepository.save(c);
                                });
        if (req.contextLabel() != null && !req.contextLabel().isBlank() && conv.getContextLabel().isBlank()) {
            conv.setContextLabel(trim(req.contextLabel(), 200));
        }
        if (req.peerAvatarUrl() != null && !req.peerAvatarUrl().isBlank()) {
            conv.setPeerAvatarUrl(trim(req.peerAvatarUrl(), 1024));
        }
        String greeting = req.greeting() != null ? req.greeting().trim() : "";
        if (!greeting.isEmpty()) {
            long count = messageRepository.findAllByConversationIdOrderByIdAsc(conv.getId()).size();
            if (count == 0) {
                appendMessage(conv, ChatSenderType.PEER, greeting);
            }
        }
        return toConvResponse(conversationRepository.save(conv));
    }

    @Transactional
    public ChatMessageResponse sendUserMessage(long conversationId, String userOpenid, ChatMessageSendRequest req) {
        ChatConversation conv = loadConversation(conversationId);
        assertUser(conv, userOpenid);
        return appendMessage(conv, ChatSenderType.USER, trim(req.content(), 4000));
    }

    @Transactional
    public ChatMessageResponse replyAsPeer(long conversationId, ChatMessageSendRequest req) {
        ChatConversation conv = loadConversation(conversationId);
        ChatMessageResponse msg = appendMessage(conv, ChatSenderType.PEER, trim(req.content(), 4000));
        conv.setUnreadForUser(conv.getUnreadForUser() + 1);
        conversationRepository.save(conv);
        return msg;
    }

    @Transactional
    public void markReadForApp(long conversationId, String userOpenid) {
        ChatConversation conv = loadConversation(conversationId);
        assertUser(conv, userOpenid);
        conv.setUnreadForUser(0);
        conversationRepository.save(conv);
    }

    @Transactional
    public void deleteConversation(long id) {
        if (!conversationRepository.existsById(id)) {
            throw new IllegalArgumentException("会话不存在");
        }
        messageRepository.deleteAllByConversationId(id);
        conversationRepository.deleteById(id);
    }

    private ChatMessageResponse appendMessage(ChatConversation conv, ChatSenderType type, String content) {
        ChatMessage m = new ChatMessage();
        m.setConversationId(conv.getId());
        m.setSenderType(type);
        m.setContent(content);
        messageRepository.save(m);
        conv.setLastMessage(content.length() <= 500 ? content : content.substring(0, 500));
        conv.setUpdatedAt(LocalDateTime.now());
        if (type == ChatSenderType.USER) {
            conv.setUnreadForUser(0);
        }
        conversationRepository.save(conv);
        return toMsgResponse(m);
    }

    private ChatConversation loadConversation(long id) {
        return conversationRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("会话不存在"));
    }

    private void assertUser(ChatConversation conv, String userOpenid) {
        if (!resolveUser(userOpenid).equals(conv.getUserOpenid())) {
            throw new IllegalArgumentException("无权访问该会话");
        }
    }

    private String resolveUser(String userOpenid) {
        if (userOpenid == null || userOpenid.isBlank()) {
            return DEFAULT_USER_OPENID;
        }
        return userOpenid.trim();
    }

    static String peerKey(String peerId, String peerName) {
        String id = peerId != null ? peerId.trim() : "";
        if (!id.isEmpty()) {
            return "p-" + id;
        }
        return "n-" + (peerName != null ? peerName.trim() : "user");
    }

    private static String trim(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }

    private static String trimOrDefault(String s, int max, String def) {
        String t = trim(s, max);
        return t.isEmpty() ? def : t;
    }

    private ChatConversationResponse toConvResponse(ChatConversation c) {
        return new ChatConversationResponse(
                c.getId(),
                c.getUserOpenid(),
                c.getPeerKey(),
                c.getPeerId(),
                c.getPeerName(),
                c.getPeerAvatarUrl(),
                c.getContextLabel(),
                c.getLastMessage(),
                formatTime(c.getUpdatedAt()),
                c.getUnreadForUser());
    }

    private ChatMessageResponse toMsgResponse(ChatMessage m) {
        String from = m.getSenderType() == ChatSenderType.USER ? "me" : "peer";
        return new ChatMessageResponse(
                m.getId(),
                m.getConversationId(),
                from,
                m.getContent(),
                formatTime(m.getCreatedAt()));
    }

    private static String formatTime(LocalDateTime dt) {
        if (dt == null) {
            return "";
        }
        LocalDateTime now = LocalDateTime.now();
        if (dt.toLocalDate().equals(now.toLocalDate())) {
            return dt.format(DateTimeFormatter.ofPattern("HH:mm"));
        }
        if (dt.toLocalDate().equals(now.toLocalDate().minusDays(1))) {
            return "昨天";
        }
        return dt.format(DateTimeFormatter.ofPattern("MM-dd"));
    }
}
