package com.smarthealth.dto.department;

public class SpecializationDto {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private String name;
    private String description;

    public SpecializationDto() {
    }

    public SpecializationDto(Long id, Long departmentId, String departmentName, String name, String description) {
        this.id = id;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
