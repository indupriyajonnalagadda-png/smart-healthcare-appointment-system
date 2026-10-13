package com.smarthealth.dto.admin;

import java.math.BigDecimal;
import java.util.Map;

public class AdminDashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long pendingDoctorApprovals;
    private long totalAppointments;
    private long confirmedAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private BigDecimal totalRevenue;
    private Map<String, Long> appointmentsByDepartment;

    public AdminDashboardStatsDto() {
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getPendingDoctorApprovals() {
        return pendingDoctorApprovals;
    }

    public void setPendingDoctorApprovals(long pendingDoctorApprovals) {
        this.pendingDoctorApprovals = pendingDoctorApprovals;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getConfirmedAppointments() {
        return confirmedAppointments;
    }

    public void setConfirmedAppointments(long confirmedAppointments) {
        this.confirmedAppointments = confirmedAppointments;
    }

    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public void setCompletedAppointments(long completedAppointments) {
        this.completedAppointments = completedAppointments;
    }

    public long getCancelledAppointments() {
        return cancelledAppointments;
    }

    public void setCancelledAppointments(long cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Map<String, Long> getAppointmentsByDepartment() {
        return appointmentsByDepartment;
    }

    public void setAppointmentsByDepartment(Map<String, Long> appointmentsByDepartment) {
        this.appointmentsByDepartment = appointmentsByDepartment;
    }
}
