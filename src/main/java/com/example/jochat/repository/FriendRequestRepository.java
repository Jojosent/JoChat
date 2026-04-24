package com.example.jochat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.jochat.entity.FriendRequest;
import com.example.jochat.entity.RequestStatus;
import com.example.jochat.entity.User;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    List<FriendRequest> findByReceiverAndStatus(User receiver, RequestStatus status);

    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    @Query("SELECT f FROM FriendRequest f WHERE (f.sender = :user OR f.receiver = :user) AND f.status = com.example.jochat.entity.RequestStatus.ACCEPTED")
    List<FriendRequest> findAcceptedFriends(@Param("user") User user);
}
