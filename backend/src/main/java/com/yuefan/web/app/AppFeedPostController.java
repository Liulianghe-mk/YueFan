package com.yuefan.web.app;

import com.yuefan.service.FeedPostAdminService;
import com.yuefan.service.FeedPostInteractionService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.FeedCommentCreateRequest;
import com.yuefan.web.dto.FeedCommentResponse;
import com.yuefan.web.dto.FeedLikeResponse;
import com.yuefan.web.dto.FeedPostResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/feed/posts")
@RequiredArgsConstructor
public class AppFeedPostController {

    private final FeedPostAdminService feedPostAdminService;
    private final FeedPostInteractionService feedPostInteractionService;

    @GetMapping
    public ApiResponse<List<FeedPostResponse>> list(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FeedPostInteractionService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(feedPostAdminService.listVisible(userOpenid));
    }

    @GetMapping("/{id}")
    public ApiResponse<FeedPostResponse> get(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FeedPostInteractionService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(feedPostAdminService.getVisible(id, userOpenid));
    }

    @PostMapping("/{id}/like")
    public ApiResponse<FeedLikeResponse> like(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FeedPostInteractionService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(feedPostInteractionService.like(id, userOpenid));
    }

    @DeleteMapping("/{id}/like")
    public ApiResponse<FeedLikeResponse> unlike(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FeedPostInteractionService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(feedPostInteractionService.unlike(id, userOpenid));
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<FeedCommentResponse>> comments(@PathVariable long id) {
        return ApiResponse.ok(feedPostInteractionService.listComments(id));
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<FeedCommentResponse> addComment(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FeedPostInteractionService.DEFAULT_USER_OPENID)
                    String userOpenid,
            @Valid @RequestBody FeedCommentCreateRequest request) {
        return ApiResponse.ok(feedPostInteractionService.addComment(id, userOpenid, request));
    }
}
