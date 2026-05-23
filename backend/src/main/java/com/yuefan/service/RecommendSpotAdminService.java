package com.yuefan.service;

import com.yuefan.domain.MeetupStatus;
import com.yuefan.domain.RecommendSpot;
import com.yuefan.repository.RecommendSpotRepository;
import com.yuefan.web.dto.RecommendSpotResponse;
import com.yuefan.web.dto.RecommendSpotWriteRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecommendSpotAdminService {

    private final RecommendSpotRepository recommendSpotRepository;

    @Transactional(readOnly = true)
    public Page<RecommendSpotResponse> list(Pageable pageable) {
        return recommendSpotRepository.findAllByOrderBySortOrderDescIdDesc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public RecommendSpotResponse get(long id) {
        return toResponse(load(id));
    }

    @Transactional
    public RecommendSpotResponse create(RecommendSpotWriteRequest req) {
        RecommendSpot e = fromRequest(new RecommendSpot(), req);
        return toResponse(recommendSpotRepository.save(e));
    }

    @Transactional
    public RecommendSpotResponse update(long id, RecommendSpotWriteRequest req) {
        RecommendSpot e = load(id);
        fromRequest(e, req);
        return toResponse(recommendSpotRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!recommendSpotRepository.existsById(id)) {
            throw new IllegalArgumentException("推荐不存在");
        }
        recommendSpotRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<RecommendSpotResponse> listPublished() {
        return recommendSpotRepository.findAllByStatusOrderBySortOrderDescIdDesc(MeetupStatus.PUBLISHED.name())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RecommendSpot load(long id) {
        return recommendSpotRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("推荐不存在"));
    }

    private RecommendSpot fromRequest(RecommendSpot e, RecommendSpotWriteRequest req) {
        e.setName(req.name().trim());
        e.setImageUrl(req.imageUrl().trim());
        e.setRating(req.rating() != null ? req.rating() : 5.0);
        e.setTags(req.tags() != null ? req.tags().trim() : "");
        e.setAddress(req.address() != null ? req.address().trim() : "");
        e.setBusinessHours(req.businessHours() != null ? req.businessHours().trim() : "");
        e.setPriceYuan(req.priceYuan());
        e.setSortOrder(req.sortOrder());
        e.setStatus(MeetupStatus.valueOf(req.status().trim().toUpperCase()).name());
        return e;
    }

    private RecommendSpotResponse toResponse(RecommendSpot e) {
        return new RecommendSpotResponse(
                e.getId(),
                e.getName(),
                e.getImageUrl(),
                e.getRating(),
                e.getTags(),
                e.getAddress(),
                e.getBusinessHours(),
                e.getPriceYuan(),
                e.getSortOrder(),
                e.getStatus());
    }
}
