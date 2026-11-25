package com.textile.salesorder.domain;

import jakarta.persistence.*;

/** Fabric quality / sort master. */
@Entity
@Table(name = "quality")
public class Quality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sortNumber;

    @Column(length = 500)
    private String description;

    private Integer defaultWidth;

    public Quality() {}

    public Quality(String sortNumber, String description, Integer defaultWidth) {
        this.sortNumber = sortNumber;
        this.description = description;
        this.defaultWidth = defaultWidth;
    }

    public Long getId() { return id; }
    public String getSortNumber() { return sortNumber; }
    public void setSortNumber(String sortNumber) { this.sortNumber = sortNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDefaultWidth() { return defaultWidth; }
    public void setDefaultWidth(Integer defaultWidth) { this.defaultWidth = defaultWidth; }
}
