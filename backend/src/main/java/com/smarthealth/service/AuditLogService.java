package com.smarthealth.service;

import com.smarthealth.dto.admin.AuditLogDto;
import com.smarthealth.dto.common.PageResponse;
import com.smarthealth.entity.AuditLog;
import com.smarthealth.entity.User;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final EntityDtoMapper mapper;

    public AuditLogService(AuditLogRepository auditLogRepository, EntityDtoMapper mapper) {
        this.auditLogRepository = auditLogRepository;
        this.mapper = mapper;
    }

    @Transactional
    public void logAction(User user, String action, String entityName, String entityId, String details) {
        try {
            AuditLog log = new AuditLog(user, action, entityName, entityId, details);
            auditLogRepository.save(log);
        } catch (Exception ignored) {
            // Failure in audit logging must not abort the primary transaction
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogDto> getAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page, page.getContent().stream().map(mapper::toAuditLogDto).toList());
    }
}
