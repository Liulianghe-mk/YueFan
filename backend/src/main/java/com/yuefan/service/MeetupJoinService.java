package com.yuefan.service;

import com.yuefan.domain.AppUser;
import com.yuefan.domain.Meetup;
import com.yuefan.domain.MeetupMember;
import com.yuefan.domain.MeetupMemberStatus;
import com.yuefan.domain.MeetupStatus;
import com.yuefan.repository.MeetupMemberRepository;
import com.yuefan.repository.MeetupRepository;
import com.yuefan.web.dto.MeetupJoinResponse;
import com.yuefan.web.dto.MeetupMemberResponse;
import com.yuefan.web.dto.MeetupResponse;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetupJoinService {

    public static final String DEFAULT_USER_OPENID = "miniapp-user";

    private final MeetupRepository meetupRepository;
    private final MeetupMemberRepository meetupMemberRepository;
    private final AppUserService appUserService;

    @Transactional(readOnly = true)
    public List<MeetupMemberResponse> listMembers(long meetupId) {
        loadMeetup(meetupId);
        return meetupMemberRepository
                .findAllByMeetupIdAndMemberStatusOrderByJoinedAtAsc(meetupId, MeetupMemberStatus.APPROVED)
                .stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MeetupMemberResponse> listPendingApplications(long meetupId, String hostOpenid) {
        Meetup m = loadMeetup(meetupId);
        assertHost(m, hostOpenid);
        return meetupMemberRepository
                .findAllByMeetupIdAndMemberStatusOrderByJoinedAtAsc(meetupId, MeetupMemberStatus.PENDING)
                .stream()
                .map(this::toMemberResponse)
                .toList();
    }

    @Transactional
    public MeetupJoinResponse join(long meetupId, String userOpenid) {
        Meetup m = loadPublished(meetupId);
        String uid = resolveUser(userOpenid);
        if (isHost(m, uid)) {
            return new MeetupJoinResponse(toResponse(m, uid), true, false);
        }
        Optional<MeetupMember> existing = meetupMemberRepository.findByMeetupIdAndUserOpenid(meetupId, uid);
        if (existing.isPresent()) {
            MeetupMember row = existing.get();
            if (row.getMemberStatus() == MeetupMemberStatus.APPROVED) {
                return new MeetupJoinResponse(toResponse(m, uid), true, false);
            }
            if (row.getMemberStatus() == MeetupMemberStatus.PENDING) {
                return new MeetupJoinResponse(toResponse(m, uid), true, true);
            }
            row.setMemberStatus(m.isRequireApproval() ? MeetupMemberStatus.PENDING : MeetupMemberStatus.APPROVED);
            meetupMemberRepository.save(row);
            syncJoinedCount(m);
            boolean pending = row.getMemberStatus() == MeetupMemberStatus.PENDING;
            return new MeetupJoinResponse(toResponse(m, uid), false, pending);
        }
        int approved = approvedCount(meetupId);
        if (approved >= m.getTotalSlots()) {
            throw new IllegalArgumentException("名额已满");
        }
        AppUser profile = appUserService.ensureUser(uid);
        MeetupMember row = new MeetupMember();
        row.setMeetupId(meetupId);
        row.setUserOpenid(uid);
        row.setNickname(profile.getNickname());
        row.setAvatarUrl(profile.getAvatarUrl() != null ? profile.getAvatarUrl() : "");
        row.setHost(false);
        row.setMemberStatus(m.isRequireApproval() ? MeetupMemberStatus.PENDING : MeetupMemberStatus.APPROVED);
        meetupMemberRepository.save(row);
        syncJoinedCount(m);
        boolean pending = row.getMemberStatus() == MeetupMemberStatus.PENDING;
        return new MeetupJoinResponse(toResponse(m, uid), false, pending);
    }

    @Transactional
    public MeetupResponse leave(long meetupId, String userOpenid) {
        Meetup m = loadPublished(meetupId);
        String uid = resolveUser(userOpenid);
        MeetupMember row = meetupMemberRepository
                .findByMeetupIdAndUserOpenid(meetupId, uid)
                .orElseThrow(() -> new IllegalArgumentException("您尚未报名该活动"));
        if (row.isHost()) {
            throw new IllegalArgumentException("发起人不能退出自己的活动");
        }
        meetupMemberRepository.delete(row);
        syncJoinedCount(m);
        return toResponse(m, uid);
    }

    @Transactional
    public MeetupResponse approveApplication(long meetupId, long memberId, String hostOpenid) {
        return reviewApplication(meetupId, memberId, hostOpenid, MeetupMemberStatus.APPROVED);
    }

    @Transactional
    public MeetupResponse rejectApplication(long meetupId, long memberId, String hostOpenid) {
        return reviewApplication(meetupId, memberId, hostOpenid, MeetupMemberStatus.REJECTED);
    }

    @Transactional
    public void addCreatorAsMember(Meetup m, String userOpenid, String nickname, String avatarUrl) {
        String uid = resolveUser(userOpenid);
        Optional<MeetupMember> existing = meetupMemberRepository.findByMeetupIdAndUserOpenid(m.getId(), uid);
        if (existing.isPresent()) {
            MeetupMember row = existing.get();
            row.setHost(true);
            row.setMemberStatus(MeetupMemberStatus.APPROVED);
            meetupMemberRepository.save(row);
            syncJoinedCount(m);
            return;
        }
        MeetupMember row = new MeetupMember();
        row.setMeetupId(m.getId());
        row.setUserOpenid(uid);
        String nick = nickname != null && !nickname.isBlank() ? nickname.trim() : AppUserService.defaultNickname(uid);
        row.setNickname(nick);
        row.setAvatarUrl(avatarUrl != null ? avatarUrl.trim() : "");
        row.setHost(true);
        row.setMemberStatus(MeetupMemberStatus.APPROVED);
        meetupMemberRepository.save(row);
        syncJoinedCount(m);
    }

    @Transactional(readOnly = true)
    public int countApprovedMembers(long meetupId) {
        return approvedCount(meetupId);
    }

    @Transactional(readOnly = true)
    public MeetupResponse toResponse(Meetup m, String userOpenid) {
        int joined = approvedCount(m.getId());
        String uid = userOpenid != null ? resolveUser(userOpenid) : null;
        Boolean joinedByMe = null;
        Boolean canJoin = null;
        Boolean isHost = null;
        String myMembershipStatus = null;
        Integer pendingApplicationCount = null;
        if (uid != null) {
            isHost = isHost(m, uid);
            Optional<MeetupMember> mine = meetupMemberRepository.findByMeetupIdAndUserOpenid(m.getId(), uid);
            if (mine.isPresent()) {
                myMembershipStatus = mine.get().getMemberStatus().name();
                joinedByMe = mine.get().getMemberStatus() == MeetupMemberStatus.APPROVED;
            }
            canJoin = canUserJoin(m, uid, mine.orElse(null), joined);
            if (Boolean.TRUE.equals(isHost)) {
                pendingApplicationCount =
                        (int) meetupMemberRepository.countByMeetupIdAndMemberStatus(m.getId(), MeetupMemberStatus.PENDING);
            }
        }
        return new MeetupResponse(
                m.getId(),
                m.getTitle(),
                m.getLocationLabel(),
                m.getTimeLabel(),
                m.getCoverUrl(),
                joined,
                m.getTotalSlots(),
                m.getStatus().name(),
                m.getCategoryTag(),
                m.getDescription(),
                m.getDistanceLabel(),
                m.getDistrict(),
                m.getHostName(),
                m.getHostAvatarUrl(),
                m.getHostRating(),
                m.getHostBadge(),
                joinedByMe,
                canJoin,
                isHost,
                m.isRequireApproval(),
                myMembershipStatus,
                pendingApplicationCount);
    }

    @Transactional(readOnly = true)
    public MeetupResponse toResponse(Meetup m) {
        return toResponse(m, null);
    }

    private MeetupResponse reviewApplication(
            long meetupId, long memberId, String hostOpenid, MeetupMemberStatus target) {
        Meetup m = loadMeetup(meetupId);
        assertHost(m, hostOpenid);
        MeetupMember row = meetupMemberRepository
                .findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("报名记录不存在"));
        if (row.getMeetupId() != meetupId) {
            throw new IllegalArgumentException("报名记录与活动不匹配");
        }
        if (row.isHost()) {
            throw new IllegalArgumentException("无法审核发起人");
        }
        if (row.getMemberStatus() != MeetupMemberStatus.PENDING) {
            throw new IllegalArgumentException("该申请已处理");
        }
        if (target == MeetupMemberStatus.APPROVED) {
            int approved = approvedCount(meetupId);
            if (approved >= m.getTotalSlots()) {
                throw new IllegalArgumentException("名额已满，无法通过");
            }
        }
        row.setMemberStatus(target);
        meetupMemberRepository.save(row);
        syncJoinedCount(m);
        return toResponse(m, resolveUser(hostOpenid));
    }

    private boolean canUserJoin(Meetup m, String uid, MeetupMember mine, int approvedCount) {
        if (m.getStatus() != MeetupStatus.PUBLISHED) {
            return false;
        }
        if (isHost(m, uid)) {
            return false;
        }
        if (mine != null) {
            if (mine.getMemberStatus() == MeetupMemberStatus.APPROVED
                    || mine.getMemberStatus() == MeetupMemberStatus.PENDING) {
                return false;
            }
        }
        return approvedCount < m.getTotalSlots();
    }

    private void syncJoinedCount(Meetup m) {
        m.setJoinedCount(approvedCount(m.getId()));
        meetupRepository.save(m);
    }

    private int approvedCount(long meetupId) {
        return (int) meetupMemberRepository.countByMeetupIdAndMemberStatus(meetupId, MeetupMemberStatus.APPROVED);
    }

    private Meetup loadMeetup(long id) {
        return meetupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("活动不存在"));
    }

    private Meetup loadPublished(long id) {
        Meetup m = loadMeetup(id);
        if (m.getStatus() != MeetupStatus.PUBLISHED) {
            throw new IllegalArgumentException("活动未发布或已结束");
        }
        return m;
    }

    private void assertHost(Meetup m, String hostOpenid) {
        String uid = resolveUser(hostOpenid);
        if (!isHost(m, uid)) {
            throw new IllegalArgumentException("仅发起人可审核报名");
        }
    }

    private boolean isHost(Meetup m, String uid) {
        return m.getHostOpenid() != null && !m.getHostOpenid().isBlank() && m.getHostOpenid().equals(uid);
    }

    private MeetupMemberResponse toMemberResponse(MeetupMember row) {
        return new MeetupMemberResponse(
                row.getId(),
                row.getMeetupId(),
                row.getUserOpenid(),
                row.getNickname(),
                row.getAvatarUrl(),
                row.getJoinedAt(),
                row.getMemberStatus().name(),
                row.isHost());
    }

    public static String resolveUserStatic(String userOpenid) {
        return resolveUser(userOpenid);
    }

    private static String resolveUser(String userOpenid) {
        if (userOpenid == null || userOpenid.isBlank()) {
            return DEFAULT_USER_OPENID;
        }
        return userOpenid.trim();
    }
}
