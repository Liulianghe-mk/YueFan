package com.yuefan.service;

import com.yuefan.domain.Influencer;
import com.yuefan.repository.InfluencerRepository;
import com.yuefan.web.dto.InfluencerResponse;
import com.yuefan.web.dto.InfluencerWriteRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InfluencerAdminService {

    private final InfluencerRepository influencerRepository;

    @Transactional(readOnly = true)
    public Page<InfluencerResponse> list(Pageable pageable) {
        return influencerRepository.findAllByOrderBySortOrderDescIdDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public InfluencerResponse get(long id) {
        return toResponse(load(id));
    }

    @Transactional
    public InfluencerResponse create(InfluencerWriteRequest req) {
        Influencer e = fromRequest(new Influencer(), req);
        return toResponse(influencerRepository.save(e));
    }

    @Transactional
    public InfluencerResponse update(long id, InfluencerWriteRequest req) {
        Influencer e = load(id);
        fromRequest(e, req);
        return toResponse(influencerRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!influencerRepository.existsById(id)) {
            throw new IllegalArgumentException("大V不存在");
        }
        influencerRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<InfluencerResponse> listEnabled() {
        return influencerRepository.findAllByEnabledTrueOrderBySortOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private Influencer load(long id) {
        return influencerRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("大V不存在"));
    }

    private Influencer fromRequest(Influencer e, InfluencerWriteRequest req) {
        e.setDisplayName(req.displayName().trim());
        e.setAvatarUrl(req.avatarUrl().trim());
        e.setBadgeLabel(req.badgeLabel() != null ? req.badgeLabel().trim() : "");
        e.setRatingText(req.ratingText() != null ? req.ratingText().trim() : "");
        e.setBio(req.bio() != null ? req.bio().trim() : "");
        e.setSortOrder(req.sortOrder());
        e.setEnabled(req.enabled());
        return e;
    }

    private InfluencerResponse toResponse(Influencer e) {
        return new InfluencerResponse(
                e.getId(),
                e.getDisplayName(),
                e.getAvatarUrl(),
                e.getBadgeLabel(),
                e.getRatingText(),
                e.getBio(),
                e.getSortOrder(),
                e.isEnabled());
    }
}
