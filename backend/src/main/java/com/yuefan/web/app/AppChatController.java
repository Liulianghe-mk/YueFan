package com.yuefan.web.app;

import com.yuefan.service.ChatService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.ChatConversationEnsureRequest;
import com.yuefan.web.dto.ChatConversationResponse;
import com.yuefan.web.dto.ChatMessageResponse;
import com.yuefan.web.dto.ChatMessageSendRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/chat")
@RequiredArgsConstructor
public class AppChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ApiResponse<List<ChatConversationResponse>> list(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = ChatService.DEFAULT_USER_OPENID) String userOpenid) {
        return ApiResponse.ok(chatService.listForApp(userOpenid));
    }

    @PostMapping("/conversations")
    public ApiResponse<ChatConversationResponse> ensure(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = ChatService.DEFAULT_USER_OPENID) String userOpenid,
            @Valid @RequestBody ChatConversationEnsureRequest request) {
        return ApiResponse.ok(chatService.ensureConversation(userOpenid, request));
    }

    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<ChatMessageResponse>> messages(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = ChatService.DEFAULT_USER_OPENID) String userOpenid) {
        chatService.markReadForApp(id, userOpenid);
        return ApiResponse.ok(chatService.listMessagesForApp(id, userOpenid));
    }

    @PostMapping("/conversations/{id}/messages")
    public ApiResponse<ChatMessageResponse> send(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = ChatService.DEFAULT_USER_OPENID) String userOpenid,
            @Valid @RequestBody ChatMessageSendRequest request) {
        return ApiResponse.ok(chatService.sendUserMessage(id, userOpenid, request));
    }

    @PostMapping("/conversations/{id}/read")
    public ApiResponse<Map<String, Boolean>> markRead(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = ChatService.DEFAULT_USER_OPENID) String userOpenid) {
        chatService.markReadForApp(id, userOpenid);
        return ApiResponse.ok(Map.of("read", true));
    }
}
