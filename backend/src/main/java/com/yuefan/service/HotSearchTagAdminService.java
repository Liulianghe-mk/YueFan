package com.yuefan.service;

import com.yuefan.domain.HotSearchTag;
import com.yuefan.repository.HotSearchTagRepository;
import com.yuefan.web.dto.HotSearchTagResponse;
import com.yuefan.web.dto.HotSearchTagWriteRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HotSearchTagAdminService {

    private final HotSearchTagRepository hotSearchTagRepository;

    @Transactional(readOnly = true)
    public Page<HotSearchTagResponse> list(Pageable pageable) {
        return hotSearchTagRepository.findAllByOrderBySortOrderAscIdAsc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public HotSearchTagResponse get(long id) {
        return toResponse(load(id));
    }

    @Transactional
    public HotSearchTagResponse create(HotSearchTagWriteRequest req) {
        HotSearchTag e = fromRequest(new HotSearchTag(), req);
        return toResponse(hotSearchTagRepository.save(e));
    }

    @Transactional
    public HotSearchTagResponse update(long id, HotSearchTagWriteRequest req) {
        HotSearchTag e = load(id);
        fromRequest(e, req);
        return toResponse(hotSearchTagRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!hotSearchTagRepository.existsById(id)) {
            throw new IllegalArgumentException("热词不存在");
        }
        hotSearchTagRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<HotSearchTagResponse> listEnabled() {
        return hotSearchTagRepository.findAllByEnabledTrueOrderBySortOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private HotSearchTag load(long id) {
        return hotSearchTagRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("热词不存在"));
    }

    private HotSearchTag fromRequest(HotSearchTag e, HotSearchTagWriteRequest req) {
        e.setLabel(req.label().trim());
        e.setSortOrder(req.sortOrder());
        e.setEnabled(req.enabled());
        return e;
    }

    private HotSearchTagResponse toResponse(HotSearchTag e) {
        return new HotSearchTagResponse(e.getId(), e.getLabel(), e.getSortOrder(), e.isEnabled());
    }
}
