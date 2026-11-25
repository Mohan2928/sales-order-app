package com.textile.salesorder.domain;

import jakarta.persistence.*;

/**
 * Generic master value used to fill the dropdowns
 * (contract type, delivery terms, payment terms, GST type, UOM, agent, ...).
 */
@Entity
@Table(name = "lookup", uniqueConstraints = @UniqueConstraint(columnNames = {"category", "name"}))
public class Lookup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(nullable = false)
    private String name;

    public Lookup() {}

    public Lookup(String category, String name) {
        this.category = category;
        this.name = name;
    }

    public Long getId() { return id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
