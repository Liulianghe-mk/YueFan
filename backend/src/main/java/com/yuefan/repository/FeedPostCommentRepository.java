package com.yuefan.repository;

import com.yuefan.domain.FeedPostComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedPostCommentRepository extends JpaRepository<FeedPostComment, Long> {

    List<FeedPostComment> findAllByPostIdOrderByCreatedAtAsc(long postId);

    long countByPostId(long postId);

    void deleteAllByPostId(long postId);

    void deleteAllByParentId(long parentId);
}
