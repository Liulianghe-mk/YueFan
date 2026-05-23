package com.yuefan.web.admin;

import com.yuefan.service.FeedPostAdminService;
import com.yuefan.service.FeedPostInteractionService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.FeedCommentResponse;
import com.yuefan.web.dto.FeedPostResponse;
import com.yuefan.web.dto.FeedPostWriteRequest;
import java.util.List;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/feed-posts")
@RequiredArgsConstructor
public class AdminFeedPostController {

    private final FeedPostAdminService feedPostAdminService;
    private final FeedPostInteractionService feedPostInteractionService;

    @GetMapping
    public ApiResponse<Page<FeedPostResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                feedPostAdminService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<FeedPostResponse> get(@PathVariable long id) {
        return ApiResponse.ok(feedPostAdminService.get(id));
    }

    @PostMapping
    public ApiResponse<FeedPostResponse> create(@Valid @RequestBody FeedPostWriteRequest request) {
        return ApiResponse.ok(feedPostAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<FeedPostResponse> update(
            @PathVariable long id, @Valid @RequestBody FeedPostWriteRequest request) {
        return ApiResponse.ok(feedPostAdminService.update(id, request));
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<FeedCommentResponse>> listComments(@PathVariable long id) {
        return ApiResponse.ok(feedPostInteractionService.listCommentsForAdmin(id));
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ApiResponse<Map<String, Boolean>> deleteComment(
            @PathVariable long postId, @PathVariable long commentId) {
        feedPostInteractionService.deleteComment(postId, commentId);
        return ApiResponse.ok(Map.of("deleted", true));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        feedPostAdminService.delete(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
