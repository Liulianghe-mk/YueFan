package com.yuefan.web.app;

import com.yuefan.service.MeetupJoinService;
import com.yuefan.service.MeetupPublicService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.MeetupAppCreateRequest;
import com.yuefan.web.dto.MeetupJoinResponse;
import com.yuefan.web.dto.MeetupMemberResponse;
import com.yuefan.web.dto.MeetupResponse;
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
@RequestMapping("/api/app/meetups")
@RequiredArgsConstructor
public class AppMeetupController {

    private final MeetupPublicService meetupPublicService;
    private final MeetupJoinService meetupJoinService;

    @GetMapping
    public ApiResponse<List<MeetupResponse>> list(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupPublicService.listPublished(userOpenid));
    }

    @GetMapping("/{id}")
    public ApiResponse<MeetupResponse> get(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupPublicService.getPublished(id, userOpenid));
    }

    @GetMapping("/{id}/members")
    public ApiResponse<List<MeetupMemberResponse>> members(@PathVariable long id) {
        return ApiResponse.ok(meetupJoinService.listMembers(id));
    }

    @PostMapping("/{id}/join")
    public ApiResponse<MeetupJoinResponse> join(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupJoinService.join(id, userOpenid));
    }

    @DeleteMapping("/{id}/join")
    public ApiResponse<MeetupResponse> leave(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupJoinService.leave(id, userOpenid));
    }

    /** 小程序发起约饭（无需登录；生产环境建议改为需 App JWT 并限流） */
    @PostMapping
    public ApiResponse<MeetupResponse> create(
            @Valid @RequestBody MeetupAppCreateRequest request,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupPublicService.createFromApp(request, userOpenid));
    }
}
