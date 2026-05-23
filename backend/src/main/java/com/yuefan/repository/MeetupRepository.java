package com.yuefan.repository;

import com.yuefan.domain.Meetup;
import com.yuefan.domain.MeetupStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetupRepository extends JpaRepository<Meetup, Long> {

    Page<Meetup> findAllByOrderByIdDesc(Pageable pageable);

    List<Meetup> findAllByStatusOrderByIdDesc(MeetupStatus status);

    long countByHostOpenid(String hostOpenid);

    List<Meetup> findAllByHostOpenidOrderByIdDesc(String hostOpenid);
}
