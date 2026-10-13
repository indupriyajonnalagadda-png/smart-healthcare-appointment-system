package com.smarthealth.service;

import com.smarthealth.entity.Notification;
import com.smarthealth.entity.User;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.repository.NotificationRepository;
import com.smarthealth.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type, String referenceId) {
        if (user == null) return;
        Notification notif = new Notification(user, title, message, type, referenceId);
        notificationRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return List.of();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            return;
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) return 0;
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
