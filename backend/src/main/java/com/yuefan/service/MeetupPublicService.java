package com.yuefan.service;

import com.yuefan.domain.AppUser;
import com.yuefan.domain.Meetup;
import com.yuefan.domain.MeetupStatus;
import com.yuefan.repository.MeetupRepository;
import com.yuefan.web.dto.MeetupAppCreateRequest;
import com.yuefan.web.dto.MeetupResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeetupPublicService {

    private static final String DEFAULT_COVER =
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&auto=format&fit=crop&q=80";

    private final MeetupRepository meetupRepository;
    private final MeetupJoinService meetupJoinService;
    private final AppUserService appUserService;

    @Transactional(readOnly = true)
    public List<MeetupResponse> listPublished(String userOpenid) {
        return meetupRepository.findAllByStatusOrderByIdDesc(MeetupStatus.PUBLISHED).stream()
                .map(m -> meetupJoinService.toResponse(m, userOpenid))
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetupResponse getPublished(long id, String userOpenid) {
        Meetup m = meetupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("活动不存在"));
        if (m.getStatus() != MeetupStatus.PUBLISHED) {
            throw new IllegalArgumentException("活动不存在");
        }
        return meetupJoinService.toResponse(m, userOpenid);
    }

    @Transactional
    public MeetupResponse createFromApp(MeetupAppCreateRequest req, String userOpenid) {
        String uid = MeetupJoinService.resolveUserStatic(userOpenid);
        AppUser profile = appUserService.ensureUser(uid);
        Meetup m = new Meetup();
        m.setTitle(trimTo(req.title(), 200));
        m.setLocationLabel(trimTo(req.locationLabel(), 255));
        m.setTimeLabel(trimTo(req.timeLabel(), 120));
        String cover = req.coverUrl() != null ? req.coverUrl().trim() : "";
        if (cover.isEmpty()) {
            cover = DEFAULT_COVER;
        }
        m.setCoverUrl(trimTo(cover, 1024));
        m.setJoinedCount(0);
        int slots = req.totalSlots();
        if (slots < 2) {
            slots = 2;
        } else if (slots > 30) {
            slots = 30;
        }
        m.setTotalSlots(slots);
        boolean pub = req.publicInvite() == null || req.publicInvite();
        m.setStatus(pub ? MeetupStatus.PUBLISHED : MeetupStatus.DRAFT);
        if (m.getCategoryTag() == null || m.getCategoryTag().isBlank()) {
            m.setCategoryTag("约饭");
        }
        m.setHostOpenid(uid);
        m.setRequireApproval(req.requireApproval() != null && req.requireApproval());
        String nick = profile.getNickname() != null ? profile.getNickname().trim() : "";
        if (!nick.isBlank()) {
            m.setHostName(trimTo(nick, 40));
        }
        String av = profile.getAvatarUrl() != null ? profile.getAvatarUrl().trim() : "";
        if (!av.isBlank()) {
            m.setHostAvatarUrl(trimTo(av, 1024));
        }
        Meetup saved = meetupRepository.save(m);
        meetupJoinService.addCreatorAsMember(saved, uid, profile.getNickname(), profile.getAvatarUrl());
        return meetupJoinService.toResponse(saved, uid);
    }

    private static String trimTo(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }
}
