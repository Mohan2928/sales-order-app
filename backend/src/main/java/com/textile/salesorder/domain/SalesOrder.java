package com.textile.salesorder.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_order")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String orderNo;

    private String invoiceType;
    private String contractType;
    private String contractOrderRoute;
    private LocalDate orderDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id")
    private Buyer buyer;

    private String buyerAddress;
    private String agent;
    private String deliveryAddress;
    private LocalDate confirmationDate;
    private String shipmentMode;
    private String deliveryTerms;
    private String paymentTerms;
    private String gstType;
    private String salesCoordinator;
    private String bank;
    private String soType;
    private String sourcingBy;
    private String buyerPo;
    private String termsAndCondition;
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesOrderLine> lines = new ArrayList<>();

    public void addLine(SalesOrderLine line) {
        line.setSalesOrder(this);
        lines.add(line);
    }

    public Long getId() { return id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public String getInvoiceType() { return invoiceType; }
    public void setInvoiceType(String invoiceType) { this.invoiceType = invoiceType; }
    public String getContractType() { return contractType; }
    public void setContractType(String contractType) { this.contractType = contractType; }
    public String getContractOrderRoute() { return contractOrderRoute; }
    public void setContractOrderRoute(String contractOrderRoute) { this.contractOrderRoute = contractOrderRoute; }
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public Buyer getBuyer() { return buyer; }
    public void setBuyer(Buyer buyer) { this.buyer = buyer; }
    public String getBuyerAddress() { return buyerAddress; }
    public void setBuyerAddress(String buyerAddress) { this.buyerAddress = buyerAddress; }
    public String getAgent() { return agent; }
    public void setAgent(String agent) { this.agent = agent; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public LocalDate getConfirmationDate() { return confirmationDate; }
    public void setConfirmationDate(LocalDate confirmationDate) { this.confirmationDate = confirmationDate; }
    public String getShipmentMode() { return shipmentMode; }
    public void setShipmentMode(String shipmentMode) { this.shipmentMode = shipmentMode; }
    public String getDeliveryTerms() { return deliveryTerms; }
    public void setDeliveryTerms(String deliveryTerms) { this.deliveryTerms = deliveryTerms; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getGstType() { return gstType; }
    public void setGstType(String gstType) { this.gstType = gstType; }
    public String getSalesCoordinator() { return salesCoordinator; }
    public void setSalesCoordinator(String salesCoordinator) { this.salesCoordinator = salesCoordinator; }
    public String getBank() { return bank; }
    public void setBank(String bank) { this.bank = bank; }
    public String getSoType() { return soType; }
    public void setSoType(String soType) { this.soType = soType; }
    public String getSourcingBy() { return sourcingBy; }
    public void setSourcingBy(String sourcingBy) { this.sourcingBy = sourcingBy; }
    public String getBuyerPo() { return buyerPo; }
    public void setBuyerPo(String buyerPo) { this.buyerPo = buyerPo; }
    public String getTermsAndCondition() { return termsAndCondition; }
    public void setTermsAndCondition(String termsAndCondition) { this.termsAndCondition = termsAndCondition; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public List<SalesOrderLine> getLines() { return lines; }
}
