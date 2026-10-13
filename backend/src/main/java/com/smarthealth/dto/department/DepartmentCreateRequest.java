package com.smarthealth.dto.department;

import jakarta.validation.constraints.NotBlank;

public class DepartmentCreateRequest {

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
    private String iconName;

    public DepartmentCreateRequest() {
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

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }
}
