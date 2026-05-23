package com.yuefan.service;

import com.yuefan.domain.Meetup;
import com.yuefan.domain.MeetupMember;
import com.yuefan.domain.MeetupMemberStatus;
import com.yuefan.domain.MeetupStatus;
import com.yuefan.repository.MeetupMemberRepository;
import com.yuefan.repository.MeetupRepository;
import com.yuefan.web.dto.MyActivitiesResponse;
import com.yuefan.web.dto.MyActivityItemResponse;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetupMyService {

    private final MeetupRepository meetupRepository;
    private final MeetupMemberRepository meetupMemberRepository;
    private final MeetupJoinService meetupJoinService;

    @Transactional(readOnly = true)
    public MyActivitiesResponse listMyActivities(String userOpenid) {
        String uid = MeetupJoinService.resolveUserStatic(userOpenid);
        List<MeetupMember> memberships = meetupMemberRepository.findAllByUserOpenidOrderByJoinedAtDesc(uid);
        List<Meetup> hosted = meetupRepository.findAllByHostOpenidOrderByIdDesc(uid);
        Map<Long, Meetup> meetupById = new HashMap<>();
        Map<Long, MeetupMember> membershipByMeetup = new HashMap<>();
        for (MeetupMember mm : memberships) {
            membershipByMeetup.put(mm.getMeetupId(), mm);
        }
        for (MeetupMember mm : memberships) {
            meetupRepository.findById(mm.getMeetupId()).ifPresent(m -> meetupById.put(m.getId(), m));
        }
        for (Meetup m : hosted) {
            meetupById.put(m.getId(), m);
        }
        Set<Long> seen = new HashSet<>();
        List<MyActivityItemResponse> upcoming = new ArrayList<>();
        for (Meetup m : hosted) {
            if (m.getStatus() != MeetupStatus.PUBLISHED) {
                continue;
            }
            if (!seen.add(m.getId())) {
                continue;
            }
            upcoming.add(toItem(m, membershipByMeetup.get(m.getId()), true, uid));
        }
        for (MeetupMember mm : memberships) {
            Meetup m = meetupById.get(mm.getMeetupId());
            if (m == null || m.getStatus() != MeetupStatus.PUBLISHED || mm.isHost()) {
                continue;
            }
            if (!seen.add(m.getId())) {
                continue;
            }
            upcoming.add(toItem(m, mm, false, uid));
        }
        upcoming.sort(Comparator.comparing(MyActivityItemResponse::meetupId).reversed());
        int pendingTotal = 0;
        for (Meetup m : hosted) {
            pendingTotal +=
                    (int) meetupMemberRepository.countByMeetupIdAndMemberStatus(m.getId(), MeetupMemberStatus.PENDING);
        }
        int initiated = (int) meetupRepository.countByHostOpenid(uid);
        return new MyActivitiesResponse(upcoming, List.of(), initiated, pendingTotal);
    }

    private MyActivityItemResponse toItem(Meetup m, MeetupMember membership, boolean forceHost, String uid) {
        boolean isHost = forceHost || (m.getHostOpenid() != null && m.getHostOpenid().equals(uid));
        String memberStatus = membership != null ? membership.getMemberStatus().name() : null;
        int pendingCount = 0;
        String cardStatus;
        String action;
        if (isHost) {
            pendingCount =
                    (int) meetupMemberRepository.countByMeetupIdAndMemberStatus(m.getId(), MeetupMemberStatus.PENDING);
            cardStatus = pendingCount > 0 ? "manage" : "confirmed";
            action = "manage";
        } else if (memberStatus != null && MeetupMemberStatus.PENDING.name().equals(memberStatus)) {
            cardStatus = "pending";
            action = "detail";
        } else {
            cardStatus = "confirmed";
            action = "detail";
        }
        DateParts parts = parseDateParts(m.getTimeLabel());
        int joined = meetupJoinService.countApprovedMembers(m.getId());
        return new MyActivityItemResponse(
                m.getId(),
                m.getTitle(),
                m.getLocationLabel(),
                m.getTimeLabel(),
                m.getCoverUrl(),
                parts.month(),
                parts.day(),
                cardStatus,
                action,
                isHost,
                memberStatus,
                pendingCount,
                joined,
                m.getTotalSlots());
    }

    private static DateParts parseDateParts(String timeLabel) {
        if (timeLabel == null || timeLabel.isBlank()) {
            return new DateParts("—", "—");
        }
        String t = timeLabel.trim();
        int monthIdx = t.indexOf('月');
        int dayIdx = t.indexOf('日');
        if (monthIdx > 0 && dayIdx > monthIdx) {
            String month = t.substring(0, monthIdx + 1);
            String day = t.substring(monthIdx + 1, dayIdx);
            return new DateParts(month, day);
        }
        return new DateParts("近期", "—");
    }

    private record DateParts(String month, String day) {}
}
