package com.yuefan.web.app;

import com.yuefan.service.MeetupJoinService;
import com.yuefan.service.MeetupMyService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.MeetupMemberResponse;
import com.yuefan.web.dto.MeetupResponse;
import com.yuefan.web.dto.MyActivitiesResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app/my")
@RequiredArgsConstructor
public class AppMyMeetupController {

    private final MeetupMyService meetupMyService;
    private final MeetupJoinService meetupJoinService;

    @GetMapping("/activities")
    public ApiResponse<MyActivitiesResponse> myActivities(
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupMyService.listMyActivities(userOpenid));
    }

    @GetMapping("/meetups/{id}/applications")
    public ApiResponse<List<MeetupMemberResponse>> pendingApplications(
            @PathVariable long id,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupJoinService.listPendingApplications(id, userOpenid));
    }

    @PostMapping("/meetups/{meetupId}/applications/{memberId}/approve")
    public ApiResponse<MeetupResponse> approve(
            @PathVariable long meetupId,
            @PathVariable long memberId,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupJoinService.approveApplication(meetupId, memberId, userOpenid));
    }

    @PostMapping("/meetups/{meetupId}/applications/{memberId}/reject")
    public ApiResponse<MeetupResponse> reject(
            @PathVariable long meetupId,
            @PathVariable long memberId,
            @RequestHeader(value = "X-Miniapp-User", defaultValue = MeetupJoinService.DEFAULT_USER_OPENID)
                    String userOpenid) {
        return ApiResponse.ok(meetupJoinService.rejectApplication(meetupId, memberId, userOpenid));
    }
}
