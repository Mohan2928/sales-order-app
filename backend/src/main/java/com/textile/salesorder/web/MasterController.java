package com.textile.salesorder.web;

import com.textile.salesorder.domain.Buyer;
import com.textile.salesorder.domain.Lookup;
import com.textile.salesorder.domain.Quality;
import com.textile.salesorder.domain.Vendor;
import com.textile.salesorder.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/** Read-only master data used by the dropdowns on the order form. */
@RestController
@RequestMapping("/api/masters")
public class MasterController {

    private final LookupRepository lookups;
    private final BuyerRepository buyers;
    private final QualityRepository qualities;
    private final VendorRepository vendors;

    @Value("${app.company-name:TOTALA TEXTILES PRIVATE LIMITED}")
    private String companyName;

    public MasterController(LookupRepository lookups, BuyerRepository buyers, QualityRepository qualities, VendorRepository vendors) {
        this.lookups = lookups;
        this.buyers = buyers;
        this.qualities = qualities;
        this.vendors = vendors;
    }

    /** All dropdown lists in one call: { "GST_TYPE": ["CGST+SGST","IGST"], ... } */
    @GetMapping("/lookups")
    public Map<String, List<String>> allLookups() {
        return lookups.findAll().stream().collect(Collectors.groupingBy(
                Lookup::getCategory, TreeMap::new,
                Collectors.collectingAndThen(Collectors.mapping(Lookup::getName, Collectors.toList()), l -> l.stream().sorted().toList())));
    }

    @PostMapping("/lookups")
    public Lookup addLookup(@RequestBody Lookup lookup) {
        if (lookups.existsByCategoryAndName(lookup.getCategory(), lookup.getName())) {
            return lookup;
        }
        return lookups.save(new Lookup(lookup.getCategory(), lookup.getName()));
    }

    @GetMapping("/buyers")
    public List<Map<String, Object>> buyers() {
        return buyers.findAllByOrderByNameAsc().stream().map(b -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", b.getId());
            m.put("name", b.getName());
            m.put("address", b.getAddress());
            m.put("gstin", b.getGstin());
            m.put("deliveryAddresses", b.getDeliveryAddresses());
            return m;
        }).toList();
    }

    @PostMapping("/buyers")
    public Buyer addBuyer(@RequestBody Buyer buyer) {
        return buyers.save(buyer);
    }

    @GetMapping("/qualities")
    public List<Quality> qualities() {
        return qualities.findAllByOrderBySortNumberAsc();
    }

    @PostMapping("/qualities")
    public Quality addQuality(@RequestBody Quality quality) {
        return qualities.save(quality);
    }

    @GetMapping("/vendors")
    public List<Map<String, Object>> vendors() {
        return vendors.findAllByOrderByNameAsc().stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", v.getId());
            m.put("name", v.getName());
            return m;
        }).toList();
    }

    @GetMapping("/company")
    public Map<String, String> company() {
        return Map.of("name", companyName);
    }
}
