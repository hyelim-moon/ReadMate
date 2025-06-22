// PostLike.java
package RM.ReadMate.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "post_like")
@Getter
@Setter
public class PostLike {

    @EmbeddedId
    private PostLikeId id;

    @MapsId("postId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    public PostLike() {}

    public PostLike(CommunityPost post, String username) {
        this.post = post;
        this.id = new PostLikeId(post.getId(), username);
    }
}
