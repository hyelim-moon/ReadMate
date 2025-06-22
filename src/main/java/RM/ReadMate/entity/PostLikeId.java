// PostLikeId.java
package RM.ReadMate.entity;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PostLikeId implements Serializable {

    private Long postId;
    private String username;

    public PostLikeId() {}

    public PostLikeId(Long postId, String username) {
        this.postId = postId;
        this.username = username;
    }

    // equals, hashCode 반드시 구현
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PostLikeId)) return false;
        PostLikeId that = (PostLikeId) o;
        return Objects.equals(postId, that.postId) &&
                Objects.equals(username, that.username);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, username);
    }

    // getters, setters
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
