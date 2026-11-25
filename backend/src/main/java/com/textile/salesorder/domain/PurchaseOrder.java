package com.textile.salesorder.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_order")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String poNumber;

    private LocalDate poDate;

    private String soNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    private String agent;

    @Column(length = 500)
    private String quality;

    @Column(precision = 15, scale = 3)
    private BigDecimal totalQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PurchaseOrderStatus status = PurchaseOrderStatus.PENDING;

    private String approverStatus;

    private String vendorGroup;
    private String fabricType;
    private String consignee;
    private String salesAddress;
    private String paymentTerms;
    private String termsAndCondition;
    private String customerSo;
    private String company;
    private String gstType = "IGST";

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<PurchaseOrderItem> items = new ArrayList<>();

    public void addItem(PurchaseOrderItem item) {
        item.setPurchaseOrder(this);
        items.add(item);
    }

    public Long getId() { return id; }
    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }
    public LocalDate getPoDate() { return poDate; }
    public void setPoDate(LocalDate poDate) { this.poDate = poDate; }
    public String getSoNumber() { return soNumber; }
    public void setSoNumber(String soNumber) { this.soNumber = soNumber; }
    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }
    public String getAgent() { return agent; }
    public void setAgent(String agent) { this.agent = agent; }
    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }
    public BigDecimal getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(BigDecimal totalQuantity) { this.totalQuantity = totalQuantity; }
    public PurchaseOrderStatus getStatus() { return status; }
    public void setStatus(PurchaseOrderStatus status) { this.status = status; }
    public String getApproverStatus() { return approverStatus; }
    public void setApproverStatus(String approverStatus) { this.approverStatus = approverStatus; }
    public String getVendorGroup() { return vendorGroup; }
    public void setVendorGroup(String vendorGroup) { this.vendorGroup = vendorGroup; }
    public String getFabricType() { return fabricType; }
    public void setFabricType(String fabricType) { this.fabricType = fabricType; }
    public String getConsignee() { return consignee; }
    public void setConsignee(String consignee) { this.consignee = consignee; }
    public String getSalesAddress() { return salesAddress; }
    public void setSalesAddress(String salesAddress) { this.salesAddress = salesAddress; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getTermsAndCondition() { return termsAndCondition; }
    public void setTermsAndCondition(String termsAndCondition) { this.termsAndCondition = termsAndCondition; }
    public String getCustomerSo() { return customerSo; }
    public void setCustomerSo(String customerSo) { this.customerSo = customerSo; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getGstType() { return gstType; }
    public void setGstType(String gstType) { this.gstType = gstType; }
    public List<PurchaseOrderItem> getItems() { return items; }
}
