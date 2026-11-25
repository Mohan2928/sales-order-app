package com.textile.salesorder.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "sales_order_line")
public class SalesOrderLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_order_id")
    private SalesOrder salesOrder;

    private String fabricType;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quality_id")
    private Quality quality;

    private String buyerProduct;
    private Integer fabricWidth;
    private String inspectionType;

    @Column(precision = 15, scale = 3)
    private BigDecimal quantity;

    private String uom;

    @Column(precision = 15, scale = 3)
    private BigDecimal pricePerUnit;

    @Column(precision = 18, scale = 2)
    private BigDecimal basicAmount;

    @Column(precision = 5, scale = 2)
    private BigDecimal gstPercent;

    @Column(precision = 18, scale = 2)
    private BigDecimal totalAmount;

    private String weaveType;
    private String packingType;
    private LocalDate deliveryDate;

    @Column(precision = 5, scale = 2)
    private BigDecimal variationPercent;

    @Column(precision = 15, scale = 3)
    private BigDecimal weavingQty;

    @Column(precision = 15, scale = 3)
    private BigDecimal purchaseQty;

    private String costingNumber;

    @Column(precision = 15, scale = 3)
    private BigDecimal dispatchQty = BigDecimal.ZERO;

    public Long getId() { return id; }
    public SalesOrder getSalesOrder() { return salesOrder; }
    public void setSalesOrder(SalesOrder salesOrder) { this.salesOrder = salesOrder; }
    public String getFabricType() { return fabricType; }
    public void setFabricType(String fabricType) { this.fabricType = fabricType; }
    public Quality getQuality() { return quality; }
    public void setQuality(Quality quality) { this.quality = quality; }
    public String getBuyerProduct() { return buyerProduct; }
    public void setBuyerProduct(String buyerProduct) { this.buyerProduct = buyerProduct; }
    public Integer getFabricWidth() { return fabricWidth; }
    public void setFabricWidth(Integer fabricWidth) { this.fabricWidth = fabricWidth; }
    public String getInspectionType() { return inspectionType; }
    public void setInspectionType(String inspectionType) { this.inspectionType = inspectionType; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getUom() { return uom; }
    public void setUom(String uom) { this.uom = uom; }
    public BigDecimal getPricePerUnit() { return pricePerUnit; }
    public void setPricePerUnit(BigDecimal pricePerUnit) { this.pricePerUnit = pricePerUnit; }
    public BigDecimal getBasicAmount() { return basicAmount; }
    public void setBasicAmount(BigDecimal basicAmount) { this.basicAmount = basicAmount; }
    public BigDecimal getGstPercent() { return gstPercent; }
    public void setGstPercent(BigDecimal gstPercent) { this.gstPercent = gstPercent; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getWeaveType() { return weaveType; }
    public void setWeaveType(String weaveType) { this.weaveType = weaveType; }
    public String getPackingType() { return packingType; }
    public void setPackingType(String packingType) { this.packingType = packingType; }
    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }
    public BigDecimal getVariationPercent() { return variationPercent; }
    public void setVariationPercent(BigDecimal variationPercent) { this.variationPercent = variationPercent; }
    public BigDecimal getWeavingQty() { return weavingQty; }
    public void setWeavingQty(BigDecimal weavingQty) { this.weavingQty = weavingQty; }
    public BigDecimal getPurchaseQty() { return purchaseQty; }
    public void setPurchaseQty(BigDecimal purchaseQty) { this.purchaseQty = purchaseQty; }
    public String getCostingNumber() { return costingNumber; }
    public void setCostingNumber(String costingNumber) { this.costingNumber = costingNumber; }
    public BigDecimal getDispatchQty() { return dispatchQty; }
    public void setDispatchQty(BigDecimal dispatchQty) { this.dispatchQty = dispatchQty; }
}
