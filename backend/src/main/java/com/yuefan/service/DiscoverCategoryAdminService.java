package com.yuefan.service;

import com.yuefan.domain.DiscoverCategory;
import com.yuefan.repository.DiscoverCategoryRepository;
import com.yuefan.web.dto.DiscoverCategoryResponse;
import com.yuefan.web.dto.DiscoverCategoryWriteRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiscoverCategoryAdminService {

    private final DiscoverCategoryRepository discoverCategoryRepository;

    @Transactional(readOnly = true)
    public Page<DiscoverCategoryResponse> list(Pageable pageable) {
        return discoverCategoryRepository.findAllByOrderBySortOrderAscIdAsc(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DiscoverCategoryResponse get(long id) {
        return toResponse(load(id));
    }

    @Transactional
    public DiscoverCategoryResponse create(DiscoverCategoryWriteRequest req) {
        DiscoverCategory e = fromRequest(new DiscoverCategory(), req);
        return toResponse(discoverCategoryRepository.save(e));
    }

    @Transactional
    public DiscoverCategoryResponse update(long id, DiscoverCategoryWriteRequest req) {
        DiscoverCategory e = load(id);
        fromRequest(e, req);
        return toResponse(discoverCategoryRepository.save(e));
    }

    @Transactional
    public void delete(long id) {
        if (!discoverCategoryRepository.existsById(id)) {
            throw new IllegalArgumentException("分类不存在");
        }
        discoverCategoryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DiscoverCategoryResponse> listEnabled() {
        return discoverCategoryRepository.findAllByEnabledTrueOrderBySortOrderAscIdAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private DiscoverCategory load(long id) {
        return discoverCategoryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("分类不存在"));
    }

    private DiscoverCategory fromRequest(DiscoverCategory e, DiscoverCategoryWriteRequest req) {
        e.setName(req.name().trim());
        e.setSortOrder(req.sortOrder());
        e.setEnabled(req.enabled());
        return e;
    }

    private DiscoverCategoryResponse toResponse(DiscoverCategory e) {
        return new DiscoverCategoryResponse(e.getId(), e.getName(), e.getSortOrder(), e.isEnabled());
    }
}
