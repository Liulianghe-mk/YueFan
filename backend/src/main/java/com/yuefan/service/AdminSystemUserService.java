package com.yuefan.service;

import com.yuefan.domain.AdminUser;
import com.yuefan.repository.AdminUserRepository;
import com.yuefan.web.dto.AdminUserListItem;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminSystemUserService {

    private final AdminUserRepository adminUserRepository;

    @Transactional(readOnly = true)
    public Page<AdminUserListItem> list(Pageable pageable) {
        return adminUserRepository.findAll(pageable)
                .map(
                        u ->
                                new AdminUserListItem(
                                        u.getId(), u.getUsername(), u.getRole(), u.isEnabled(), u.getCreatedAt()));
    }
}
