package com.yuefan.web.admin;

import com.yuefan.service.MeetupAdminService;
import com.yuefan.web.dto.ApiResponse;
import com.yuefan.web.dto.MeetupMemberResponse;
import com.yuefan.web.dto.MeetupResponse;
import com.yuefan.web.dto.MeetupWriteRequest;
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
@RequestMapping("/api/admin/meetups")
@RequiredArgsConstructor
public class AdminMeetupController {

    private final MeetupAdminService meetupAdminService;

    @GetMapping
    public ApiResponse<Page<MeetupResponse>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(meetupAdminService.list(PageRequest.of(Math.max(0, page), Math.min(100, size))));
    }

    @GetMapping("/{id}")
    public ApiResponse<MeetupResponse> get(@PathVariable long id) {
        return ApiResponse.ok(meetupAdminService.get(id));
    }

    @GetMapping("/{id}/members")
    public ApiResponse<List<MeetupMemberResponse>> listMembers(@PathVariable long id) {
        return ApiResponse.ok(meetupAdminService.listMembers(id));
    }

    @PostMapping
    public ApiResponse<MeetupResponse> create(@Valid @RequestBody MeetupWriteRequest request) {
        return ApiResponse.ok(meetupAdminService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MeetupResponse> update(
            @PathVariable long id, @Valid @RequestBody MeetupWriteRequest request) {
        return ApiResponse.ok(meetupAdminService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(@PathVariable long id) {
        meetupAdminService.delete(id);
        return ApiResponse.ok(Map.of("deleted", true));
    }
}
