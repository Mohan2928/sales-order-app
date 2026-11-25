package com.textile.salesorder.config;

import com.textile.salesorder.domain.*;
import com.textile.salesorder.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Loads sample master data the first time the app starts on an empty database. */
@Configuration
public class DataSeeder {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final BigDecimal DEFAULT_GST = BigDecimal.valueOf(5);

    @Value("${app.order-no-prefix}")
    private String orderNoPrefix;

    /** Seeding mode: "always" (default), "once", or "never". Used so only a one-time Job seeds in Kubernetes. */
    @Value("${app.seed.mode:always}")
    private String seedMode;

    @Bean
    CommandLineRunner seed(LookupRepository lookups, BuyerRepository buyers, QualityRepository qualities,
                           PurchaseOrderRepository purchaseOrders, VendorRepository vendors,
                           SalesOrderRepository salesOrders) {
        return args -> {
            if ("never".equalsIgnoreCase(seedMode)) {
                return;
            }
            seedMasters(lookups, buyers, qualities);
            ensureLookupCategories(lookups);
            ensureVendors(vendors);
            seedPurchaseOrders(purchaseOrders, vendors);
            seedSalesOrders(salesOrders, buyers, qualities);
            if ("once".equalsIgnoreCase(seedMode)) {
                // One-shot seed run (Kubernetes Job): data is already committed per save,
                // so halt the JVM immediately to avoid the web-server graceful-shutdown hang.
                Runtime.getRuntime().halt(0);
            }
        };
    }

    private void seedMasters(LookupRepository lookups, BuyerRepository buyers, QualityRepository qualities) {
        if (lookups.count() > 0) return;

        Map<String, List<String>> data = Map.ofEntries(
                Map.entry("INVOICE_TYPE", List.of("RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)")),
                Map.entry("CONTRACT_TYPE", List.of("Bulk Contract", "Sample Contract", "Repeat Contract")),
                Map.entry("CONTRACT_ROUTE", List.of("Direct", "Via Agent")),
                Map.entry("AGENT", List.of("DIRECT", "Agent A", "Agent B")),
                Map.entry("SHIPMENT_MODE", List.of("BY ROAD", "BY RAIL", "BY AIR", "BY SEA")),
                Map.entry("DELIVERY_TERMS", List.of("EX-MILL", "FOR", "CIF")),
                Map.entry("PAYMENT_TERMS", List.of("Advance", "30 Days", "45 Days", "60 Days")),
                Map.entry("GST_TYPE", List.of("CGST + SGST", "IGST")),
                Map.entry("SALES_COORDINATOR", List.of("TR.RITESH", "TR.AMIT")),
                Map.entry("BANK", List.of("HDFC BANK", "SBI", "ICICI BANK")),
                Map.entry("SO_TYPE", List.of("Greige Bulk Orders", "Dyed Orders", "Sample Orders")),
                Map.entry("SOURCING_BY", List.of("AIRJET", "EXPORT", "RAPIER")),
                Map.entry("TERMS_AND_CONDITION", List.of("Standard Terms", "Export Terms")),
                Map.entry("FABRIC_TYPE", List.of("Greige", "Dyed", "Finished")),
                Map.entry("INSPECTION_TYPE", List.of("4 Point", "10 Point", "Buyer Inspection")),
                Map.entry("UOM", List.of("MTR", "YDS", "KG")),
                Map.entry("PACKING_TYPE", List.of("Roll", "Bale", "Folded")),
                Map.entry("WEAVE_TYPE", List.of("Plain", "Twill", "Satin", "Dobby")));

        data.forEach((cat, names) -> names.forEach(n -> lookups.save(new Lookup(cat, n))));

        buyers.save(new Buyer("RAJVEER EXIM", "12 Industrial Area, Surat, Gujarat", "24AAAAA0000A1Z5",
                List.of("12 Industrial Area, Surat, Gujarat", "Godown 4, Sachin GIDC, Surat")));
        buyers.save(new Buyer("RATANMOTI TEXFAB (I) PVT LTD DIV-02", "Plot 7, Textile Park, Ahmedabad, Gujarat",
                "24BBBBB1111B1Z5", List.of("Plot 7, Textile Park, Ahmedabad, Gujarat")));
        buyers.save(new Buyer("SELF STOCK", "Mill Premises", null, List.of("Mill Premises")));

        qualities.save(new Quality("67GFP686833S",
                "67\" 30SX30S 68X68 PLAIN 1/1", 67));
        qualities.save(new Quality("DYD56 DYED PATTERN",
                "64.5\" 20/1LYCL SLB DYED+20/1LYCL SLB DYED (1*1) 56X52 PLAIN 1/1", 64));
        qualities.save(new Quality("20 SLB",
                "RS68.5 20LYCL SLBX20LYCL SLB 52/2X48 PLAIN", 68));
        qualities.save(new Quality("20X20 NIMBUDA",
                "RS 68.5 20NIMBUDAX20NIMBUDA 56/2X52 PLAIN", 68));
    }

    private void ensureLookupCategories(LookupRepository lookups) {
        ensureLookups(lookups, "VENDOR_GROUP", List.of("Fabric Vendor", "Yarn Vendor", "Job Work"));
        ensureLookups(lookups, "CONSIGNEE", List.of("Self", "Buyer Godown"));
        ensureLookups(lookups, "CERTIFICATION_TYPE", List.of("GOTS", "OCS", "GRS", "BCI", "Oeko-Tex"));
        ensureLookups(lookups, "GST_PERCENT", List.of("0", "5", "12", "18"));
    }

    private void ensureLookups(LookupRepository lookups, String category, List<String> names) {
        for (String n : names) {
            if (!lookups.existsByCategoryAndName(category, n)) {
                lookups.save(new Lookup(category, n));
            }
        }
    }

    private void ensureVendors(VendorRepository vendors) {
        for (String name : List.of("KANCHAN COTTON MILLS", "SRI SALASAR SILK INDUSTRIES", "H M")) {
            vendors.findByName(name).orElseGet(() -> vendors.save(new Vendor(name)));
        }
    }

    private void seedPurchaseOrders(PurchaseOrderRepository purchaseOrders, VendorRepository vendors) {
        if (purchaseOrders.count() > 0) return;

        Vendor kanchan = vendors.findByName("KANCHAN COTTON MILLS").orElseGet(() -> vendors.save(new Vendor("KANCHAN COTTON MILLS")));
        Vendor salasar = vendors.findByName("SRI SALASAR SILK INDUSTRIES").orElseGet(() -> vendors.save(new Vendor("SRI SALASAR SILK INDUSTRIES")));
        Vendor hm = vendors.findByName("H M").orElseGet(() -> vendors.save(new Vendor("H M")));

        PurchaseOrder p1 = new PurchaseOrder();
        p1.setPoDate(LocalDate.of(2025, 3, 19));
        p1.setPoNumber("TTPL/25/00011");
        p1.setSoNumber(null);
        p1.setVendor(kanchan);
        p1.setAgent("GIRIRAJ MUNDRA");
        p1.setQuality("1258 - 80\" 60/1CCWX85/1POLY LYC (1*1) 160X88 3 MOVE SATIN");
        p1.setTotalQuantity(new BigDecimal("16182.00"));
        p1.setStatus(PurchaseOrderStatus.PENDING);
        p1.setApproverStatus(null);
        purchaseOrders.save(p1);

        PurchaseOrder p2 = new PurchaseOrder();
        p2.setPoDate(LocalDate.of(2023, 9, 18));
        p2.setPoNumber("TTPL/24/F00006");
        p2.setSoNumber(null);
        p2.setVendor(salasar);
        p2.setAgent(null);
        p2.setQuality("32F - 58\"/60X60/180X100 R BLUE");
        p2.setTotalQuantity(new BigDecimal("821.00"));
        p2.setStatus(PurchaseOrderStatus.PENDING);
        p2.setApproverStatus(null);
        purchaseOrders.save(p2);

        PurchaseOrder p3 = new PurchaseOrder();
        p3.setPoDate(LocalDate.of(2023, 3, 27));
        p3.setPoNumber("TTPL/23/F00002");
        p3.setSoNumber(null);
        p3.setVendor(hm);
        p3.setAgent(null);
        p3.setQuality("1F - 58\"/60X60/210X110 BLACK");
        p3.setTotalQuantity(new BigDecimal("1000.00"));
        p3.setStatus(PurchaseOrderStatus.PENDING);
        p3.setApproverStatus(null);
        purchaseOrders.save(p3);
    }

    private void seedSalesOrders(SalesOrderRepository salesOrders, BuyerRepository buyers, QualityRepository qualities) {
        if (salesOrders.count() > 0) return;

        List<Buyer> buyerList = buyers.findAllByOrderByNameAsc();
        List<Quality> qualityList = qualities.findAllByOrderBySortNumberAsc();
        if (buyerList.isEmpty() || qualityList.isEmpty()) return;

        Buyer rajveer = buyerList.get(0);
        Buyer ratanmoti = buyerList.get(Math.min(1, buyerList.size() - 1));
        Buyer selfStock = buyerList.get(buyerList.size() - 1);

        Quality q1 = qualityList.get(0);
        Quality q2 = qualityList.get(Math.min(1, qualityList.size() - 1));
        Quality q3 = qualityList.get(qualityList.size() - 1);

        saveSalesOrder(salesOrders, LocalDate.of(2026, 6, 12), rajveer, "DIRECT",
                "12 Industrial Area, Surat, Gujarat", "RAJVEER/PO/2026/001",
                List.of(line(q1, "RJV-A1", 67, "Greige", "4 Point", "Plain", "Roll",
                        new BigDecimal("5000.000"), "MTR", new BigDecimal("42.50"),
                        LocalDate.of(2026, 7, 20), new BigDecimal("5.00"))));

        saveSalesOrder(salesOrders, LocalDate.of(2026, 7, 5), ratanmoti, "Agent A",
                "Plot 7, Textile Park, Ahmedabad, Gujarat", "RATAN/PO/2026/014",
                List.of(
                        line(q2, "RTM-DYD-01", 64, "Dyed", "Buyer Inspection", "Plain", "Roll",
                                new BigDecimal("3200.000"), "MTR", new BigDecimal("58.00"),
                                LocalDate.of(2026, 8, 15), new BigDecimal("5.00")),
                        line(q3, "RTM-DYD-02", 68, "Dyed", "Buyer Inspection", "Plain", "Bale",
                                new BigDecimal("1800.000"), "MTR", new BigDecimal("61.00"),
                                LocalDate.of(2026, 8, 15), new BigDecimal("5.00"))));

        saveSalesOrder(salesOrders, LocalDate.of(2026, 8, 21), selfStock, "DIRECT",
                "Mill Premises", "STOCK/CF/2026/007",
                List.of(line(q3, "STK-20SLB", 68, "Greige", "10 Point", "Plain", "Bale",
                        new BigDecimal("12000.000"), "MTR", new BigDecimal("39.75"),
                        LocalDate.of(2026, 9, 10), new BigDecimal("5.00"))));
    }

    private void saveSalesOrder(SalesOrderRepository salesOrders, LocalDate orderDate, Buyer buyer, String agent,
                                String buyerAddress, String buyerPo, List<SalesOrderLine> lines) {
        SalesOrder o = new SalesOrder();
        o.setOrderDate(orderDate);
        o.setBuyer(buyer);
        o.setAgent(agent);
        o.setBuyerAddress(buyerAddress);
        o.setBuyerPo(buyerPo);
        o.setInvoiceType("RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)");
        o.setContractType("Bulk Contract");
        o.setContractOrderRoute("Direct");
        o.setShipmentMode("BY ROAD");
        o.setDeliveryTerms("EX-MILL");
        o.setPaymentTerms("30 Days");
        o.setGstType("CGST + SGST");
        o.setSalesCoordinator("TR.RITESH");
        o.setBank("HDFC BANK");
        o.setSoType("Greige Bulk Orders");
        o.setSourcingBy("AIRJET");
        o.setTermsAndCondition("Standard Terms");
        o.setStatus(OrderStatus.PENDING);
        for (SalesOrderLine l : lines) {
            o.addLine(l);
        }
        SalesOrder saved = salesOrders.saveAndFlush(o);
        saved.setOrderNo(orderNoPrefix + String.format("%04d", saved.getId()));
        salesOrders.save(saved);
    }

    private SalesOrderLine line(Quality quality, String buyerProduct, Integer width, String fabricType,
                                String inspectionType, String weaveType, String packingType,
                                BigDecimal quantity, String uom, BigDecimal pricePerUnit,
                                LocalDate deliveryDate, BigDecimal gstPercent) {
        BigDecimal gst = gstPercent == null ? DEFAULT_GST : gstPercent;
        BigDecimal basic = quantity.multiply(pricePerUnit).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = basic.add(basic.multiply(gst).divide(HUNDRED, 2, RoundingMode.HALF_UP));

        SalesOrderLine l = new SalesOrderLine();
        l.setQuality(quality);
        l.setBuyerProduct(buyerProduct);
        l.setFabricWidth(width);
        l.setFabricType(fabricType);
        l.setInspectionType(inspectionType);
        l.setWeaveType(weaveType);
        l.setPackingType(packingType);
        l.setQuantity(quantity);
        l.setUom(uom);
        l.setPricePerUnit(pricePerUnit);
        l.setGstPercent(gst);
        l.setBasicAmount(basic);
        l.setTotalAmount(total);
        l.setDeliveryDate(deliveryDate);
        return l;
    }
}
