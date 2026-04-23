package com.example.jochat.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.jochat.entity.FriendRequest;
import com.example.jochat.entity.RequestStatus; // Не забудьте импорт!
import com.example.jochat.entity.User; // Не забудьте импорт!
import com.example.jochat.repository.FriendRequestRepository;
import com.example.jochat.repository.UserRepository; // Не забудьте импорт!

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository, FriendRequestRepository friendRequestRepository) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
    }

    // Получить профиль
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            User safeUser = user.get();
            safeUser.setPassword(null); // Никогда не отправляем пароль на фронт!
            return ResponseEntity.ok(safeUser);
        }
        return ResponseEntity.notFound().build();
    }

// Обновить профиль конкретного пользователя
    @PutMapping("/update/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User updatedUser) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();

            // Обновляем данные
            existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
            existingUser.setBirthDate(updatedUser.getBirthDate());
            existingUser.setAvatarUrl(updatedUser.getAvatarUrl());
            // Если хотите, чтобы email тоже можно было менять, раскомментируйте строку ниже:
            // existingUser.setEmail(updatedUser.getEmail());

            userRepository.save(existingUser);
            return ResponseEntity.ok(existingUser);
        }
        return ResponseEntity.status(404).body(Map.of("message", "Пользователь не найден"));
    }

    @PostMapping("/upload-avatar/{username}")
    public ResponseEntity<?> uploadAvatar(@PathVariable String username, @RequestParam("file") MultipartFile file) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Пользователь не найден"));
            }

            // 1. Создаем папку uploads, если её еще нет
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // 2. Генерируем уникальное имя файла (чтобы файлы с одинаковыми именами не затерли друг друга)
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(fileName);

            // 3. Сохраняем файл на диск
            Files.copy(file.getInputStream(), filePath);

            // 4. Обновляем URL в базе данных
            User user = userOptional.get();
            String avatarUrl = "http://localhost:8080/uploads/" + fileName;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Фото успешно загружено!",
                    "avatarUrl", avatarUrl
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Ошибка при сохранении файла на сервере"));
        }
    }

    // ----------------------------------------------------------------------------------------------------
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String q) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(q);
        // Очищаем пароли перед отправкой списка
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(users);
    }

    // 2. Получить профиль с инфой о подписках
    @GetMapping("/profile/{targetUsername}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String targetUsername, @RequestParam String currentUser) {
        Optional<User> targetOpt = userRepository.findByUsername(targetUsername);
        Optional<User> currentOpt = userRepository.findByUsername(currentUser);

        if (targetOpt.isPresent() && currentOpt.isPresent()) {
            User targetUser = targetOpt.get();
            User current = currentOpt.get();

            boolean isFollowing = targetUser.getFollowers().contains(current);

            // Собираем безопасный ответ
            return ResponseEntity.ok(Map.of(
                    "username", targetUser.getUsername(),
                    "avatarUrl", targetUser.getAvatarUrl() != null ? targetUser.getAvatarUrl() : "",
                    "followersCount", targetUser.getFollowers().size(),
                    "followingCount", targetUser.getFollowing().size(),
                    "isFollowing", isFollowing
            ));
        }
        return ResponseEntity.notFound().build();
    }

    // 3. Подписаться / Отписаться
    @PostMapping("/{targetUsername}/toggle-follow")
    public ResponseEntity<?> toggleFollow(@PathVariable String targetUsername, @RequestParam String currentUser) {
        Optional<User> targetOpt = userRepository.findByUsername(targetUsername);
        Optional<User> currentOpt = userRepository.findByUsername(currentUser);

        if (targetOpt.isPresent() && currentOpt.isPresent()) {
            User targetUser = targetOpt.get();
            User current = currentOpt.get();

            // Нельзя подписаться на самого себя
            if (targetUser.getId().equals(current.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Нельзя подписаться на себя"));
            }

            boolean isFollowing;
            if (targetUser.getFollowers().contains(current)) {
                targetUser.getFollowers().remove(current); // Отписка
                isFollowing = false;
            } else {
                targetUser.getFollowers().add(current); // Подписка
                isFollowing = true;
            }

            userRepository.save(targetUser);
            return ResponseEntity.ok(Map.of(
                    "isFollowing", isFollowing,
                    "followersCount", targetUser.getFollowers().size()
            ));
        }
        return ResponseEntity.notFound().build();
    }
    // ----------------------------------------------------------------------------------------------------

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    // 1. Отправить запрос в друзья
    @PostMapping("/friends/request/{targetUsername}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable String targetUsername, @RequestParam String currentUser) {
        User sender = userRepository.findByUsername(currentUser).get();
        User receiver = userRepository.findByUsername(targetUsername).get();

        if (friendRequestRepository.findBySenderAndReceiver(sender, receiver).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Запрос уже отправлен"));
        }

        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(RequestStatus.PENDING);
        friendRequestRepository.save(request);

        return ResponseEntity.ok(Map.of("message", "Запрос отправлен"));
    }

    // 2. Показать все входящие заявки (для колокольчика/уведомлений)
    @GetMapping("/friends/pending")
    public ResponseEntity<?> getPendingRequests(@RequestParam String currentUser) {
        User user = userRepository.findByUsername(currentUser).get();
        List<FriendRequest> requests = friendRequestRepository.findByReceiverAndStatus(user, RequestStatus.PENDING);

        // Преобразуем в удобный список для фронта
        return ResponseEntity.ok(requests.stream().map(r -> Map.of(
                "requestId", r.getId(),
                "senderName", r.getSender().getUsername(),
                "senderAvatar", r.getSender().getAvatarUrl() != null ? r.getSender().getAvatarUrl() : ""
        )).toList());
    }

    // 3. Принять или отклонить запрос
    @PostMapping("/friends/respond/{requestId}")
    public ResponseEntity<?> respondToRequest(@PathVariable Long requestId, @RequestParam String action) {
        FriendRequest request = friendRequestRepository.findById(requestId).get();
        if ("accept".equals(action)) {
            request.setStatus(RequestStatus.ACCEPTED);
            // Здесь можно также добавить логику в таблицу друзей, если она есть
        } else {
            request.setStatus(RequestStatus.REJECTED);
        }
        friendRequestRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Успешно"));
    }
}
