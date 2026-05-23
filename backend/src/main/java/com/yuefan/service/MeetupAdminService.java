package com.yuefan.service;

import com.yuefan.domain.Meetup;
import com.yuefan.domain.MeetupMemberStatus;
import com.yuefan.domain.MeetupStatus;
import com.yuefan.repository.MeetupMemberRepository;
import com.yuefan.repository.MeetupRepository;
import com.yuefan.web.dto.MeetupResponse;
import com.yuefan.web.dto.MeetupWriteRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetupAdminService {

    private final MeetupRepository meetupRepository;
    private final MeetupMemberRepository meetupMemberRepository;
    private final MeetupJoinService meetupJoinService;

    @Transactional(readOnly = true)
    public Page<MeetupResponse> list(Pageable pageable) {
        return meetupRepository.findAllByOrderByIdDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public MeetupResponse get(long id) {
        Meetup m = meetupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("活动不存在"));
        return toResponse(m);
    }

    @Transactional
    public MeetupResponse create(MeetupWriteRequest req) {
        Meetup m = fromRequest(new Meetup(), req);
        Meetup saved = meetupRepository.save(m);
        syncJoinedCount(saved, req.joinedCount());
        return toResponse(meetupRepository.findById(saved.getId()).orElseThrow());
    }

    @Transactional
    public MeetupResponse update(long id, MeetupWriteRequest req) {
        Meetup m = meetupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("活动不存在"));
        fromRequest(m, req);
        Meetup saved = meetupRepository.save(m);
        syncJoinedCount(saved, req.joinedCount());
        return toResponse(meetupRepository.findById(saved.getId()).orElseThrow());
    }

    @Transactional
    public void delete(long id) {
        if (!meetupRepository.existsById(id)) {
            throw new IllegalArgumentException("活动不存在");
        }
        meetupMemberRepository.deleteAllByMeetupId(id);
        meetupRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.yuefan.web.dto.MeetupMemberResponse> listMembers(long meetupId) {
        return meetupJoinService.listMembers(meetupId);
    }

    private Meetup fromRequest(Meetup m, MeetupWriteRequest req) {
        m.setTitle(req.title().trim());
        m.setCategoryTag(nullToEmpty(req.categoryTag(), 64));
        m.setDescription(nullToEmpty(req.description(), 280));
        m.setDistanceLabel(nullToEmpty(req.distanceLabel(), 32));
        m.setDistrict(nullToEmpty(req.district(), 24));
        m.setLocationLabel(req.locationLabel().trim());
        m.setTimeLabel(req.timeLabel().trim());
        m.setCoverUrl(req.coverUrl().trim());
        m.setHostName(nullToEmpty(req.hostName(), 40));
        m.setHostAvatarUrl(nullToEmpty(req.hostAvatarUrl(), 1024));
        m.setHostRating(nullToEmpty(req.hostRating(), 8));
        m.setHostBadge(nullToEmpty(req.hostBadge(), 32));
        m.setTotalSlots(req.totalSlots());
        m.setStatus(MeetupStatus.valueOf(req.status().trim().toUpperCase()));
        return m;
    }

    private void syncJoinedCount(Meetup m, Integer manualJoined) {
        int memberCount =
                (int) meetupMemberRepository.countByMeetupIdAndMemberStatus(m.getId(), MeetupMemberStatus.APPROVED);
        if (memberCount > 0) {
            m.setJoinedCount(memberCount);
        } else if (manualJoined != null && manualJoined >= 0) {
            m.setJoinedCount(manualJoined);
        } else {
            m.setJoinedCount(0);
        }
        meetupRepository.save(m);
    }

    private static String nullToEmpty(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }

    private MeetupResponse toResponse(Meetup m) {
        return meetupJoinService.toResponse(m);
    }
}
