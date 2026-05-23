package com.yuefan.repository;

import com.yuefan.domain.MeetupMember;
import com.yuefan.domain.MeetupMemberStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetupMemberRepository extends JpaRepository<MeetupMember, Long> {

    long countByMeetupIdAndMemberStatus(long meetupId, MeetupMemberStatus memberStatus);

    boolean existsByMeetupIdAndUserOpenid(long meetupId, String userOpenid);

    Optional<MeetupMember> findByMeetupIdAndUserOpenid(long meetupId, String userOpenid);

    void deleteByMeetupIdAndUserOpenid(long meetupId, String userOpenid);

    List<MeetupMember> findAllByMeetupIdOrderByJoinedAtAsc(long meetupId);

    List<MeetupMember> findAllByMeetupIdAndMemberStatusOrderByJoinedAtAsc(
            long meetupId, MeetupMemberStatus memberStatus);

    List<MeetupMember> findAllByUserOpenidOrderByJoinedAtDesc(String userOpenid);

    List<MeetupMember> findAllByMeetupIdInAndMemberStatusOrderByJoinedAtAsc(
            Collection<Long> meetupIds, MeetupMemberStatus memberStatus);

    void deleteAllByMeetupId(long meetupId);
}
