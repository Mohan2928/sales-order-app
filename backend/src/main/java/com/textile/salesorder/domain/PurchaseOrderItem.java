package com.textile.salesorder.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_order_item")
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurchaseOrder purchaseOrder;

    private String quality;
    private String displayQuality;

    @Column(precision = 15, scale = 3)
    private BigDecimal quantity;

    private String uom;

    @Column(precision = 15, scale = 3)
    private BigDecimal unitPrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal basicAmount;

    @Column(precision = 5, scale = 2)
    private BigDecimal gstPercent;

    @Column(precision = 15, scale = 2)
    private BigDecimal gstAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalAmount;

    private String deliveryTerms;

    @Column(precision = 15, scale = 2)
    private BigDecimal provisionalFreight;

    @Column(precision = 15, scale = 2)
    private BigDecimal millGstPrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal finalPrice;

    private LocalDate deliveryDate;

    @Column(length = 1000)
    private String remark;

    @ElementCollection
    @CollectionTable(name = "purchase_order_item_certification", joinColumns = @JoinColumn(name = "purchase_order_item_id"))
    @Column(name = "certification_type")
    @OrderColumn(name = "cert_index")
    private List<String> certifications = new ArrayList<>();

    public Long getId() { return id; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }
    public String getDisplayQuality() { return displayQuality; }
    public void setDisplayQuality(String displayQuality) { this.displayQuality = displayQuality; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getBasicAmount() { return basicAmount; }
    public void setBasicAmount(BigDecimal basicAmount) { this.basicAmount = basicAmount; }
    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal gstPercent) { this.gstPercent = gstPercent; }
    public BigDecimal getGstAmount() { return gstAmount; }
    public void setGstAmount(BigDecimal gstAmount) { this.gstAmount = gstAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getDeliveryTerms() { return deliveryTerms; }
    public void setDeliveryTerms(String deliveryTerms) { this.deliveryTerms = deliveryTerms; }
    public BigDecimal getProvisionalFreight() { return provisionalFreight; }
    public void setProvisionalFreight(BigDecimal provisionalFreight) { this.provisionalFreight = provisionalFreight; }
    public BigDecimal getMillGstPrice() { return millGstPrice; }
    public void setMillGstPrice(BigDecimal millGstPrice) { this.millGstPrice = millGstPrice; }
    public BigDecimal getFinalPrice() { return finalPrice; }
    public void setFinalPrice(BigDecimal finalPrice) { this.finalPrice = finalPrice; }
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }
}
