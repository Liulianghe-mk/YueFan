package com.yuefan.repository;

import com.yuefan.domain.AppUser;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByOpenid(String openid);

    Optional<AppUser> findByUsername(String username);

    boolean existsByOpenid(String openid);

    boolean existsByUsername(String username);

    Page<AppUser> findAllByOrderByIdDesc(Pageable pageable);

    @Query(
            """
            SELECT u FROM AppUser u
            WHERE (:kw IS NULL OR :kw = ''
                OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :kw, '%'))
                OR LOWER(u.openid) LIKE LOWER(CONCAT('%', :kw, '%'))
                OR LOWER(u.username) LIKE LOWER(CONCAT('%', :kw, '%')))
            ORDER BY u.id DESC
            """)
    Page<AppUser> search(@Param("kw") String keyword, Pageable pageable);
}
