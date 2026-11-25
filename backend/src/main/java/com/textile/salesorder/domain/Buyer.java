package com.textile.salesorder.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "buyer")
public class Buyer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String address;

    private String gstin;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "buyer_delivery_address", joinColumns = @JoinColumn(name = "buyer_id"))
    @Column(name = "address")
    private List<String> deliveryAddresses = new ArrayList<>();

    public Buyer() {}

    public Buyer(String name, String address, String gstin, List<String> deliveryAddresses) {
        this.name = name;
        this.address = address;
        this.gstin = gstin;
        this.deliveryAddresses = new ArrayList<>(deliveryAddresses);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }
    public List<String> getDeliveryAddresses() { return deliveryAddresses; }
    public void setDeliveryAddresses(List<String> deliveryAddresses) { this.deliveryAddresses = deliveryAddresses; }
}
