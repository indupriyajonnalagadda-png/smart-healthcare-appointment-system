package com.smarthealth.dto.appointment;

import com.smarthealth.entity.Appointment;
import jakarta.validation.constraints.NotNull;

public class AppointmentStatusUpdateRequest {

    @NotNull(message = "New status is required")
    private Appointment.Status status;

    private String comments;

    public AppointmentStatusUpdateRequest() {
    }

    public Appointment.Status getStatus() {
        return status;
    }

    public void setStatus(Appointment.Status status) {
        this.status = status;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
