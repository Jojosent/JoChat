package com.example.jochat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.jochat.entity.ChatGroup;
import com.example.jochat.entity.Message;
import com.example.jochat.entity.User;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE (m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1) ORDER BY m.timestamp ASC")
    List<Message> findChatHistory(@Param("user1") User user1, @Param("user2") User user2);
    // Добавить к существующим методам:

    @Query("SELECT m FROM Message m WHERE m.group = :group ORDER BY m.timestamp ASC")
    List<Message> findGroupHistory(@Param("group") ChatGroup group);
}
