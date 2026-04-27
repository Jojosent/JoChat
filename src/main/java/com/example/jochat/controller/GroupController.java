package com.example.jochat.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.jochat.entity.ChatGroup;
import com.example.jochat.entity.GroupMember;
import com.example.jochat.entity.User;
import com.example.jochat.repository.ChatGroupRepository;
import com.example.jochat.repository.GroupMemberRepository;
import com.example.jochat.repository.UserRepository;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final ChatGroupRepository chatGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupController(ChatGroupRepository chatGroupRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository) {
        this.chatGroupRepository = chatGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    // 1. Создание группы
    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody Map<String, Object> payload) {
        String groupName = (String) payload.get("name");
        String creatorUsername = (String) payload.get("creator");
        List<String> memberUsernames = (List<String>) payload.get("members");

        User creator = userRepository.findByUsername(creatorUsername).orElseThrow();

        // Создаем саму группу
        ChatGroup group = new ChatGroup();
        group.setName(groupName);
        group.setCreator(creator);
        chatGroupRepository.save(group);

        // Добавляем создателя в участники
        GroupMember admin = new GroupMember();
        admin.setGroup(group);
        admin.setUser(creator);
        groupMemberRepository.save(admin);

        // Добавляем остальных друзей в участники
        for (String username : memberUsernames) {
            Optional<User> memberOpt = userRepository.findByUsername(username);
            if (memberOpt.isPresent()) {
                GroupMember member = new GroupMember();
                member.setGroup(group);
                member.setUser(memberOpt.get());
                groupMemberRepository.save(member);
            }
        }

        return ResponseEntity.ok(Map.of("id", group.getId(), "name", group.getName()));
    }

    // 2. Получение списка всех групп пользователя
    @GetMapping("/my")
    public ResponseEntity<?> getMyGroups(@RequestParam String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<GroupMember> memberships = groupMemberRepository.findByUser(user);

        List<Map<String, Object>> groups = memberships.stream().map(m -> {
            ChatGroup g = m.getGroup();
            return Map.<String, Object>of(
                    "id", g.getId(),
                    "name", g.getName(),
                    "isGroup", true
            );
        }).toList();

        return ResponseEntity.ok(groups);
    }
}
