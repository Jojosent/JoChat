package com.example.jochat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.jochat.entity.ChatGroup;
import com.example.jochat.entity.GroupMember;
import com.example.jochat.entity.User;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    // Найти все записи о членстве конкретного пользователя
    List<GroupMember> findByUser(User user);
    // Найти всех участников конкретной группы
    List<GroupMember> findByGroup(ChatGroup group);
}