package RM.ReadMate.repository;

import RM.ReadMate.entity.Friendship;
import RM.ReadMate.entity.FriendshipStatus;
import RM.ReadMate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // 특정 사용자(requester)가 보낸 친구 요청 중 특정 사용자(addressee)에게 보낸 요청 찾기
    Optional<Friendship> findByRequesterAndAddressee(User requester, User addressee);

    // 특정 사용자(requester)가 특정 사용자(addressee)에게 보낸 요청 또는 그 반대의 경우 찾기 (양방향 체크)
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requester = :user1 AND f.addressee = :user2) OR " +
           "(f.requester = :user2 AND f.addressee = :user1)")
    Optional<Friendship> findExistingFriendship(@Param("user1") User user1, @Param("user2") User user2);

    // 특정 사용자의 친구 목록 조회 (ACCEPTED 상태) - requester와 addressee를 즉시 로딩
    @Query("SELECT f FROM Friendship f JOIN FETCH f.requester r JOIN FETCH f.addressee a WHERE " +
           "(r = :user OR a = :user) AND f.status = 'ACCEPTED'")
    List<Friendship> findAllAcceptedFriendshipsByUser(@Param("user") User user);

    // 특정 사용자가 보낸 친구 요청 목록 조회 (PENDING 상태)
    List<Friendship> findByRequesterAndStatus(User requester, FriendshipStatus status);

    // 특정 사용자가 받은 친구 요청 목록 조회 (PENDING 상태)
    List<Friendship> findByAddresseeAndStatus(User addressee, FriendshipStatus status);

    // 특정 사용자와 다른 사용자 간의 ACCEPTED 상태 친구 관계 찾기
    @Query("SELECT f FROM Friendship f WHERE " +
           "((f.requester = :user1 AND f.addressee = :user2) OR " +
           "(f.requester = :user2 AND f.addressee = :user1)) AND f.status = 'ACCEPTED'")
    Optional<Friendship> findAcceptedFriendship(@Param("user1") User user1, @Param("user2") User user2);

    // 특정 사용자가 친구 요청을 보냈는지 확인 (PENDING 상태)
    boolean existsByRequesterAndAddresseeAndStatus(User requester, User addressee, FriendshipStatus status);

    // 특정 사용자가 친구 요청을 받았는지 확인 (PENDING 상태)
    boolean existsByAddresseeAndRequesterAndStatus(User addressee, User requester, FriendshipStatus status);

    // 특정 사용자가 요청자이거나 수신자인 모든 친구 관계 조회 - requester와 addressee를 즉시 로딩
    @Query("SELECT f FROM Friendship f JOIN FETCH f.requester r JOIN FETCH f.addressee a WHERE r = :user OR a = :user")
    List<Friendship> findByRequesterOrAddressee(@Param("user") User user);
}
