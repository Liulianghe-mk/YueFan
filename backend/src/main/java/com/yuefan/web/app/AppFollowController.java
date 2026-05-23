package com.yuefan.web.app;

import com.yuefan.service.FollowService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.FollowSetRequest;
import com.yuefan.web.dto.FollowStateResponse;
import com.yuefan.web.dto.FollowedPersonResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/follows")
@RequiredArgsConstructor
public class AppFollowController {

    private final FollowService followService;

    /** 结识的好友：当前用户关注的大V列表 */
    @GetMapping("/following")
    public ApiResponse<List<FollowedPersonResponse>> listFollowing(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FollowService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(followService.listFollowing(userOpenid));
    }

    @GetMapping("/influencer-ids")
    public ApiResponse<List<Long>> listIds(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FollowService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(followService.listFollowedInfluencerIds(userOpenid));
    }

    @PutMapping("/{influencerId}")
    public ApiResponse<FollowStateResponse> setFollowing(
            @PathVariable long influencerId,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = FollowService.DEFAULT_USER_OPENID)
                    String userOpenid,
            @RequestBody(required = false) @Valid FollowSetRequest request,
            @RequestParam(name = "following", required = false) Boolean followingQuery) {
        Boolean following = request != null ? request.following() : followingQuery;
        if (following == null) {
            throw new IllegalArgumentException("请指定 following（true/false）");
        }
        return ApiResponse.ok(
                followService.setFollowing(userOpenid, influencerId, Boolean.TRUE.equals(following)));
    }
}
