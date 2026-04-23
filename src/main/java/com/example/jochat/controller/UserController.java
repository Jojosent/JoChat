package com.example.jochat.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

import com.example.jochat.entity.User;
import com.example.jochat.repository.UserRepository;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
