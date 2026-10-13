package com.smarthealth.dto.doctor;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilityExceptionDto {
    private Long id;
    private LocalDate exceptionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private boolean allDay = true;

    public AvailabilityExceptionDto() {
    }

    public AvailabilityExceptionDto(Long id, LocalDate exceptionDate, LocalTime startTime, LocalTime endTime, String reason, boolean allDay) {
        this.id = id;
        this.exceptionDate = exceptionDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
        this.allDay = allDay;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getExceptionDate() {
        return exceptionDate;
    }

    public void setExceptionDate(LocalDate exceptionDate) {
        this.exceptionDate = exceptionDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public boolean isAllDay() {
        return allDay;
    }

    public void setAllDay(boolean allDay) {
        this.allDay = allDay;
    }
}
