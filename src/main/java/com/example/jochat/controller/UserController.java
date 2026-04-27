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
    // 1. ОБНОВЛЕННЫЙ МЕТОД ПОИСКА (Теперь возвращает статус дружбы)
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String q, @RequestParam String currentUser) {
        Optional<User> currentOpt = userRepository.findByUsername(currentUser);
        if (currentOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User current = currentOpt.get();

        List<User> users = userRepository.findByUsernameContainingIgnoreCase(q);

        List<Map<String, Object>> result = users.stream()
                .filter(u -> !u.getId().equals(current.getId())) // Исключаем самого себя
                .map(u -> {
                    String status = "NONE";

                    // Ищем заявку в обе стороны
                    Optional<FriendRequest> req1 = friendRequestRepository.findBySenderAndReceiver(current, u);
                    Optional<FriendRequest> req2 = friendRequestRepository.findBySenderAndReceiver(u, current);

                    if (req1.isPresent()) {
                        status = req1.get().getStatus().name(); // PENDING, ACCEPTED или REJECTED
                    } else if (req2.isPresent()) {
                        status = req2.get().getStatus().name();
                    }

                    return Map.<String, Object>of(
                            "id", u.getId(),
                            "username", u.getUsername(),
                            "avatarUrl", u.getAvatarUrl() != null ? u.getAvatarUrl() : "",
                            "friendStatus", status // Передаем статус на фронтенд!
                    );
                }).toList();

        return ResponseEntity.ok(result);
    }

    // 2. НОВЫЙ МЕТОД ДЛЯ УДАЛЕНИЯ ИЗ ДРУЗЕЙ
    @PostMapping("/friends/remove/{targetUsername}")
    public ResponseEntity<?> removeFriend(@PathVariable String targetUsername, @RequestParam String currentUser) {
        User current = userRepository.findByUsername(currentUser).get();
        User target = userRepository.findByUsername(targetUsername).get();

        // Ищем и удаляем связь в базе данных
        Optional<FriendRequest> req1 = friendRequestRepository.findBySenderAndReceiver(current, target);
        Optional<FriendRequest> req2 = friendRequestRepository.findBySenderAndReceiver(target, current);

        req1.ifPresent(friendRequestRepository::delete);
        req2.ifPresent(friendRequestRepository::delete);

        return ResponseEntity.ok(Map.of("message", "Пользователь удален из друзей"));
    }

    // 2. Получить профиль с инфой о подписках
    @GetMapping("/profile/{targetUsername}")
    public ResponseEntity<?> getPublicProfile(@PathVariable String targetUsername, @RequestParam String currentUser) {
        Optional<User> targetOpt = userRepository.findByUsername(targetUsername);
        Optional<User> currentOpt = userRepository.findByUsername(currentUser);

        if (targetOpt.isPresent() && currentOpt.isPresent()) {
            User targetUser = targetOpt.get();
            User current = currentOpt.get();

            String status = "NONE";

            // СТРОГАЯ ПРОВЕРКА В ОБЕ СТОРОНЫ:
            // req1: Я отправил ему заявку?
            Optional<FriendRequest> req1 = friendRequestRepository.findBySenderAndReceiver(current, targetUser);
            // req2: Он отправил мне заявку?
            Optional<FriendRequest> req2 = friendRequestRepository.findBySenderAndReceiver(targetUser, current);

            if (req1.isPresent()) {
                status = req1.get().getStatus().name();
            } else if (req2.isPresent()) {
                status = req2.get().getStatus().name();
            }

            int friendsCount = friendRequestRepository.findAcceptedFriends(targetUser).size();

            return ResponseEntity.ok(Map.of(
                    "username", targetUser.getUsername(),
                    "avatarUrl", targetUser.getAvatarUrl() != null ? targetUser.getAvatarUrl() : "",
                    "friendsCount", friendsCount,
                    "friendStatus", status // Теперь статус всегда будет правильным!
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
// МЕТОД ОТПРАВКИ ЗАЯВКИ В ДРУЗЬЯ (С ЗАЩИТОЙ ОТ ДУБЛИКАТОВ)
    @PostMapping("/friends/request/{targetUsername}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable String targetUsername, @RequestParam String currentUser) {
        User sender = userRepository.findByUsername(currentUser).get();
        User target = userRepository.findByUsername(targetUsername).get();

        // 1. СТРОГАЯ ПРОВЕРКА: Ищем связь в обе стороны
        Optional<FriendRequest> req1 = friendRequestRepository.findBySenderAndReceiver(sender, target);
        Optional<FriendRequest> req2 = friendRequestRepository.findBySenderAndReceiver(target, sender);

        // Если заявка или дружба уже существует (от А к Б или от Б к А) — блокируем!
        if (req1.isPresent() || req2.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Связь между пользователями уже существует"));
        }

        // 2. Если связей нет, создаем новую заявку
        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(target);

        // ВНИМАНИЕ: Убедитесь, что ваш статус называется именно так (RequestStatus.PENDING)
        request.setStatus(com.example.jochat.entity.RequestStatus.PENDING);

        friendRequestRepository.save(request);

        return ResponseEntity.ok(Map.of("message", "Заявка успешно отправлена"));
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
@PostMapping("/friends/respond/{id}")
    public ResponseEntity<?> respondToRequest(@PathVariable Long id, @RequestParam String action) {
        Optional<FriendRequest> requestOpt = friendRequestRepository.findById(id);
        
        if (requestOpt.isPresent()) {
            FriendRequest request = requestOpt.get();
            
            if ("accept".equals(action)) {
                // Если нажали "Принять" — меняем статус на ACCEPTED и СОХРАНЯЕМ в базу
                request.setStatus(com.example.jochat.entity.RequestStatus.ACCEPTED);
                friendRequestRepository.save(request);
            } else if ("reject".equals(action)) {
                // Если отклонили — просто удаляем заявку, чтобы можно было отправить снова
                friendRequestRepository.delete(request);
            }
            return ResponseEntity.ok(Map.of("message", "Статус успешно обновлен"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Заявка не найдена"));
    }
}
