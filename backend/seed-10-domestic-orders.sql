-- Seeds 10 additional DOMESTIC sales orders (header + lines) into the sales_order / sales_order_line tables.
-- Safe to run against a database that already has the 3 DataSeeder orders.
-- order_no is assigned from the generated id (prefix + 4-digit id) so it always matches the row id.
-- Each run inserts 10 new orders.

BEGIN;

-- 1) PENDING - RAJVEER EXIM (single line)
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-1', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Bulk Contract', 'Direct', DATE '2026-06-15',
     (SELECT id FROM buyer WHERE name = 'RAJVEER EXIM'), '12 Industrial Area, Surat, Gujarat', 'DIRECT',
     '12 Industrial Area, Surat, Gujarat', DATE '2026-06-30', 'BY ROAD', 'EX-MILL', '30 Days', 'CGST + SGST',
     'TR.RITESH', 'HDFC BANK', 'Greige Bulk Orders', 'AIRJET', 'RAJVEER/PO/2026/010', 'Standard Terms', 'PENDING')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Greige', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '67GFP686833S') q
CROSS JOIN (VALUES ('RJV-500-A', 67, '4 Point', 5000.000, 42.50, 'Plain', 'Roll', DATE '2026-07-25'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 2) PENDING - RATANMOTI TEXFAB (two lines)
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-2', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Repeat Contract', 'Via Agent', DATE '2026-06-28',
     (SELECT id FROM buyer WHERE name = 'RATANMOTI TEXFAB (I) PVT LTD DIV-02'), 'Plot 7, Textile Park, Ahmedabad, Gujarat', 'Agent B',
     'Plot 7, Textile Park, Ahmedabad, Gujarat', DATE '2026-07-10', 'BY ROAD', 'FOR', '45 Days', 'IGST',
     'TR.AMIT', 'SBI', 'Dyed Orders', 'RAPIER', 'RATAN/PO/2026/044', 'Standard Terms', 'PENDING')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Dyed', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = 'DYD56 DYED PATTERN') q
CROSS JOIN (VALUES
  ('RTM-DYD-A', 64, 'Buyer Inspection', 3200.000, 58.00, 'Plain', 'Roll', DATE '2026-08-15'),
  ('RTM-DYD-B', 64, 'Buyer Inspection', 1800.000, 61.00, 'Plain', 'Bale', DATE '2026-08-15'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 3) ON_HOLD - RAJVEER EXIM
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-3', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Sample Contract', 'Direct', DATE '2026-07-03',
     (SELECT id FROM buyer WHERE name = 'RAJVEER EXIM'), '12 Industrial Area, Surat, Gujarat', 'DIRECT',
     'Godown 4, Sachin GIDC, Surat', DATE '2026-07-18', 'BY AIR', 'EX-MILL', 'Advance', 'CGST + SGST',
     'TR.RITESH', 'HDFC BANK', 'Sample Orders', 'AIRJET', 'RAJVEER/PO/2026/021', 'Standard Terms', 'ON_HOLD')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Greige', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '20 SLB') q
CROSS JOIN (VALUES ('RJV-20SLB-C', 68, '10 Point', 6400.000, 40.00, 'Plain', 'Bale', DATE '2026-08-05'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 4) MOVED_TO_PRODUCTION - RATANMOTI TEXFAB
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-4', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Bulk Contract', 'Via Agent', DATE '2026-07-19',
     (SELECT id FROM buyer WHERE name = 'RATANMOTI TEXFAB (I) PVT LTD DIV-02'), 'Plot 7, Textile Park, Ahmedabad, Gujarat', 'Agent A',
     'Plot 7, Textile Park, Ahmedabad, Gujarat', DATE '2026-08-02', 'BY ROAD', 'CIF', '60 Days', 'IGST',
     'TR.AMIT', 'ICICI BANK', 'Greige Bulk Orders', 'RAPIER', 'RATAN/PO/2026/051', 'Standard Terms', 'MOVED_TO_PRODUCTION')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Greige', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '20X20 NIMBUDA') q
CROSS JOIN (VALUES ('RTM-NIM-A', 68, '4 Point', 9000.000, 44.00, 'Plain', 'Roll', DATE '2026-09-01'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 5) PENDING - SELF STOCK
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-5', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Bulk Contract', 'Direct', DATE '2026-08-04',
     (SELECT id FROM buyer WHERE name = 'SELF STOCK'), 'Mill Premises', 'DIRECT',
     'Mill Premises', DATE '2026-08-20', 'BY ROAD', 'EX-MILL', '30 Days', 'CGST + SGST',
     'TR.RITESH', 'HDFC BANK', 'Greige Bulk Orders', 'AIRJET', 'STOCK/CF/2026/031', 'Standard Terms', 'PENDING')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Greige', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '67GFP686833S') q
CROSS JOIN (VALUES ('STK-500-A', 67, '10 Point', 15000.000, 39.75, 'Plain', 'Bale', DATE '2026-09-12'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 6) COMPLETED - RAJVEER EXIM (two lines, one dispatched)
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-6', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Repeat Contract', 'Direct', DATE '2026-05-20',
     (SELECT id FROM buyer WHERE name = 'RAJVEER EXIM'), '12 Industrial Area, Surat, Gujarat', 'DIRECT',
     '12 Industrial Area, Surat, Gujarat', DATE '2026-06-05', 'BY ROAD', 'FOR', '45 Days', 'CGST + SGST',
     'TR.RITESH', 'SBI', 'Dyed Orders', 'AIRJET', 'RAJVEER/PO/2026/003', 'Standard Terms', 'COMPLETED')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Dyed', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, v.dispatched
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = 'DYD56 DYED PATTERN') q
CROSS JOIN (VALUES
  ('RJV-DYD-01', 64, 'Buyer Inspection', 2500.000, 57.00, 'Plain', 'Roll', DATE '2026-06-30', 2500.000),
  ('RJV-DYD-02', 64, 'Buyer Inspection', 1500.000, 60.00, 'Plain', 'Bale', DATE '2026-06-30', 1500.000))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date, dispatched);

-- 7) PENDING - RATANMOTI TEXFAB
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-7', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Bulk Contract', 'Via Agent', DATE '2026-08-26',
     (SELECT id FROM buyer WHERE name = 'RATANMOTI TEXFAB (I) PVT LTD DIV-02'), 'Plot 7, Textile Park, Ahmedabad, Gujarat', 'Agent A',
     'Plot 7, Textile Park, Ahmedabad, Gujarat', DATE '2026-09-10', 'BY RAIL', 'FOR', '30 Days', 'IGST',
     'TR.AMIT', 'HDFC BANK', 'Greige Bulk Orders', 'RAPIER', 'RATAN/PO/2026/063', 'Standard Terms', 'PENDING')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Greige', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '20 SLB') q
CROSS JOIN (VALUES ('RTM-20SLB-D', 68, '4 Point', 7200.000, 41.00, 'Plain', 'Roll', DATE '2026-10-01'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 8) ON_HOLD - SELF STOCK
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-8', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Sample Contract', 'Direct', DATE '2026-09-02',
     (SELECT id FROM buyer WHERE name = 'SELF STOCK'), 'Mill Premises', 'DIRECT',
     'Mill Premises', DATE '2026-09-18', 'BY ROAD', 'EX-MILL', 'Advance', 'CGST + SGST',
     'TR.RITESH', 'ICICI BANK', 'Sample Orders', 'AIRJET', 'STOCK/CF/2026/040', 'Standard Terms', 'ON_HOLD')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Finished', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '20X20 NIMBUDA') q
CROSS JOIN (VALUES ('STK-NIM-S', 68, '10 Point', 2000.000, 46.50, 'Plain', 'Folded', DATE '2026-10-15'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 9) MOVED_TO_PRODUCTION - RAJVEER EXIM
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-9', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Bulk Contract', 'Direct', DATE '2026-09-14',
     (SELECT id FROM buyer WHERE name = 'RAJVEER EXIM'), '12 Industrial Area, Surat, Gujarat', 'DIRECT',
     'Godown 4, Sachin GIDC, Surat', DATE '2026-09-30', 'BY SEA', 'CIF', '60 Days', 'IGST',
     'TR.AMIT', 'SBI', 'Greige Bulk Orders', 'AIRJET', 'RAJVEER/PO/2026/058', 'Export Terms', 'MOVED_TO_PRODUCTION')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Greige', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = '67GFP686833S') q
CROSS JOIN (VALUES ('RJV-500-B', 67, '4 Point', 11000.000, 43.25, 'Plain', 'Roll', DATE '2026-10-30'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- 10) PENDING - RATANMOTI TEXFAB (two lines)
WITH o AS (
  INSERT INTO sales_order
    (order_no, invoice_type, contract_type, contract_order_route, order_date, buyer_id, buyer_address,
     agent, delivery_address, confirmation_date, shipment_mode, delivery_terms, payment_terms, gst_type,
     sales_coordinator, bank, so_type, sourcing_by, buyer_po, terms_and_condition, status)
  VALUES
    ('TMP-10', 'RATANMOTI TEXFAB (INDIA) PVT. LTD. (DIV - 4)', 'Repeat Contract', 'Via Agent', DATE '2026-09-29',
     (SELECT id FROM buyer WHERE name = 'RATANMOTI TEXFAB (I) PVT LTD DIV-02'), 'Plot 7, Textile Park, Ahmedabad, Gujarat', 'Agent B',
     'Plot 7, Textile Park, Ahmedabad, Gujarat', DATE '2026-10-15', 'BY ROAD', 'FOR', '45 Days', 'CGST + SGST',
     'TR.RITESH', 'HDFC BANK', 'Dyed Orders', 'RAPIER', 'RATAN/PO/2026/072', 'Standard Terms', 'PENDING')
  RETURNING id
)
INSERT INTO sales_order_line
  (sales_order_id, fabric_type, quality_id, buyer_product, fabric_width, inspection_type, quantity, uom,
   price_per_unit, basic_amount, gst_percent, total_amount, weave_type, packing_type, delivery_date, dispatch_qty)
SELECT o.id, 'Dyed', q.id, v.buyer_product, v.width, v.inspection, v.quantity, 'MTR', v.price,
       round(v.quantity * v.price, 2), 5.00, round(v.quantity * v.price * 1.05, 2),
       v.weave, v.packing, v.delivery_date, 0
FROM o
CROSS JOIN (SELECT id FROM quality WHERE sort_number = 'DYD56 DYED PATTERN') q
CROSS JOIN (VALUES
  ('RTM-DYD-E', 64, 'Buyer Inspection', 4100.000, 59.00, 'Plain', 'Roll', DATE '2026-11-20'),
  ('RTM-NIM-F', 68, 'Buyer Inspection', 2600.000, 47.00, 'Plain', 'Bale', DATE '2026-11-20'))
  AS v(buyer_product, width, inspection, quantity, price, weave, packing, delivery_date);

-- Assign real order_no (prefix + zero-padded id) to every row inserted above.
UPDATE sales_order
SET order_no = 'RM-D4/DGF/26-27/D-' || lpad(id::text, 4, '0')
WHERE order_no LIKE 'TMP-%';

COMMIT;