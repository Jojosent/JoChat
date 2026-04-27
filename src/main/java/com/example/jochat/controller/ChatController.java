package com.example.jochat.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.jochat.entity.ChatGroup;
import com.example.jochat.entity.FriendRequest;
import com.example.jochat.entity.Message;
import com.example.jochat.entity.User;
import com.example.jochat.repository.ChatGroupRepository;
import com.example.jochat.repository.FriendRequestRepository;
import com.example.jochat.repository.MessageRepository;
import com.example.jochat.repository.UserRepository;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final FriendRequestRepository friendRequestRepository; // 1. ДОБАВИЛИ ПЕРЕМЕННУЮ

    // 2. ОБНОВИЛИ КОНСТРУКТОР (добавили FriendRequestRepository)
    public ChatController(MessageRepository messageRepository,
            UserRepository userRepository,
            ChatGroupRepository chatGroupRepository,
            FriendRequestRepository friendRequestRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.chatGroupRepository = chatGroupRepository;
        this.friendRequestRepository = friendRequestRepository; // 3. ПРИСВОИЛИ ЗНАЧЕНИЕ
    }

    // 1. Получить список друзей (левая панель)
    @GetMapping("/friends")
    public ResponseEntity<?> getFriendsList(@RequestParam String currentUser) {
        User user = userRepository.findByUsername(currentUser).get();
        List<FriendRequest> accepted = friendRequestRepository.findAcceptedFriends(user);

        List<Map<String, Object>> friendsList = accepted.stream().map(req -> {
            // Определяем, кто из двоих друг, а кто текущий юзер
            User friend = req.getSender().equals(user) ? req.getReceiver() : req.getSender();
            return Map.<String, Object>of(
                    "username", friend.getUsername(),
                    "avatarUrl", friend.getAvatarUrl() != null ? friend.getAvatarUrl() : ""
            );
        }).toList();

        return ResponseEntity.ok(friendsList);
    }

    // 2. Получить историю сообщений (правая панель)
    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(@RequestParam String user1, @RequestParam String user2) {
        User u1 = userRepository.findByUsername(user1).get();
        User u2 = userRepository.findByUsername(user2).get();
        List<Message> history = messageRepository.findChatHistory(u1, u2);

        return ResponseEntity.ok(history.stream().map(m -> Map.of(
                "id", m.getId(),
                "sender", m.getSender().getUsername(),
                "content", m.getContent(),
                "timestamp", m.getTimestamp().toString()
        )).toList());
    }

    // 3. Отправить сообщение
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestParam String sender, @RequestParam String receiver, @RequestBody Map<String, String> payload) {
        User s = userRepository.findByUsername(sender).get();
        User r = userRepository.findByUsername(receiver).get();

        Message m = new Message();
        m.setSender(s);
        m.setReceiver(r);
        m.setContent(payload.get("content"));
        messageRepository.save(m);

        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/sendGroup")
    public ResponseEntity<?> sendGroupMessage(@RequestParam String sender,
            @RequestParam Long groupId,
            @RequestBody Map<String, String> payload) {
        User s = userRepository.findByUsername(sender).orElseThrow();
        ChatGroup g = chatGroupRepository.findById(groupId).orElseThrow();

        Message m = new Message();
        m.setSender(s);
        m.setGroup(g); // Указываем группу вместо receiver
        m.setContent(payload.get("content"));
        messageRepository.save(m);

        return ResponseEntity.ok(Map.of("status", "ok"));
    }

// Получить историю группы
    @GetMapping("/groupHistory")
    public ResponseEntity<?> getGroupHistory(@RequestParam Long groupId) {
        ChatGroup g = chatGroupRepository.findById(groupId).orElseThrow();
        List<Message> history = messageRepository.findGroupHistory(g);

        return ResponseEntity.ok(history.stream().map(m -> Map.of(
                "id", m.getId(),
                "sender", m.getSender().getUsername(),
                "content", m.getContent(),
                "timestamp", m.getTimestamp().toString()
        )).toList());
    }
}
