package com.yuefan.web.admin;

import com.yuefan.service.ChatService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.ChatConversationResponse;
import com.yuefan.web.dto.ChatMessageResponse;
import com.yuefan.web.dto.ChatMessageSendRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
public class AdminChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public ApiResponse<Page<ChatConversationResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                chatService.listForAdmin(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/conversations/{id}")
    public ApiResponse<ChatConversationResponse> get(@PathVariable long id) {
        return ApiResponse.ok(chatService.getConversation(id));
    }

    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<ChatMessageResponse>> messages(@PathVariable long id) {
        return ApiResponse.ok(chatService.listMessages(id));
    }

    @PostMapping("/conversations/{id}/reply")
    public ApiResponse<ChatMessageResponse> reply(
            @PathVariable long id, @Valid @RequestBody ChatMessageSendRequest request) {
        return ApiResponse.ok(chatService.replyAsPeer(id, request));
    }

    @DeleteMapping("/conversations/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        chatService.deleteConversation(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
