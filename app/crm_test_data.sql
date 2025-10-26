-- =============================================
-- CRM TEST DATA GENERATION SCRIPT
-- Creates comprehensive test data for all CRM features
-- Prerequisites: Users already created via setup_users_crm.sql
-- =============================================

BEGIN;

-- Get user IDs for reference
DO $$
DECLARE
    admin_user_id TEXT;
    pm_user_id TEXT;
    accounting_user_id TEXT;
    corporate_user_id TEXT;
    org_id TEXT := 'org_demo_1';
BEGIN
    -- Get user IDs
    SELECT id INTO admin_user_id FROM "User" WHERE email = 'admin@demo.com';
    SELECT id INTO pm_user_id FROM "User" WHERE email = 'pm@demo.com';
    SELECT id INTO accounting_user_id FROM "User" WHERE email = 'accounting@demo.com';
    SELECT id INTO corporate_user_id FROM "User" WHERE email = 'corporate@demo.com';

    -- =============================================
    -- PHASE 3: PROPERTIES, GL ACCOUNTS, EXPENSE TYPES
    -- =============================================

    -- Create Properties
    INSERT INTO "Property" (id, "createdAt", "updatedAt", name, address, code, "isActive", "organizationId")
    VALUES
        ('prop_001', NOW(), NOW(), 'Sunset Apartments', '123 Sunset Blvd, Los Angeles, CA 90001', 'PROP001', true, org_id),
        ('prop_002', NOW(), NOW(), 'Downtown Lofts', '456 Main Street, Los Angeles, CA 90012', 'PROP002', true, org_id),
        ('prop_003', NOW(), NOW(), 'Harbor View Condos', '789 Ocean Ave, Los Angeles, CA 90291', 'PROP003', true, org_id),
        ('prop_004', NOW(), NOW(), 'Green Valley Homes', '321 Valley Road, Los Angeles, CA 90077', 'PROP004', true, org_id);

    -- Create GL Accounts
    INSERT INTO "GLAccount" (id, "createdAt", "updatedAt", "accountNumber", name, "accountType", "isActive", "organizationId")
    VALUES
        ('gl_001', NOW(), NOW(), '5000', 'Maintenance Expense', 'EXPENSE', true, org_id),
        ('gl_002', NOW(), NOW(), '5100', 'Utilities Expense', 'EXPENSE', true, org_id),
        ('gl_003', NOW(), NOW(), '5200', 'Landscaping Expense', 'EXPENSE', true, org_id),
        ('gl_004', NOW(), NOW(), '5300', 'Property Management Fees', 'EXPENSE', true, org_id),
        ('gl_005', NOW(), NOW(), '5400', 'Insurance Expense', 'EXPENSE', true, org_id),
        ('gl_006', NOW(), NOW(), '5500', 'Professional Services', 'EXPENSE', true, org_id),
        ('gl_007', NOW(), NOW(), '1000', 'Cash', 'ASSET', true, org_id);

    -- Create Expense Types
    INSERT INTO "ExpenseType" (id, "createdAt", "updatedAt", name, code, "isActive", "organizationId")
    VALUES
        ('exp_001', NOW(), NOW(), 'Plumbing Repair', 'PLUMB001', true, org_id),
        ('exp_002', NOW(), NOW(), 'HVAC Service', 'HVAC001', true, org_id),
        ('exp_003', NOW(), NOW(), 'Electrical Work', 'ELEC001', true, org_id),
        ('exp_004', NOW(), NOW(), 'Water Bill', 'WATER001', true, org_id),
        ('exp_005', NOW(), NOW(), 'Electric Bill', 'ELEC002', true, org_id),
        ('exp_006', NOW(), NOW(), 'Lawn Care', 'LAWN001', true, org_id),
        ('exp_007', NOW(), NOW(), 'Tree Service', 'TREE001', true, org_id),
        ('exp_008', NOW(), NOW(), 'Property Insurance', 'INS001', true, org_id),
        ('exp_009', NOW(), NOW(), 'Legal Services', 'LEGAL001', true, org_id),
        ('exp_010', NOW(), NOW(), 'Accounting Services', 'ACCT001', true, org_id);

    -- =============================================
    -- PHASE 4: RESIDENTS
    -- =============================================

    -- Create Residents with Leases
    INSERT INTO "Resident" (
        id, "createdAt", "updatedAt", "firstName", "lastName", email, "phoneNumber",
        "unitNumber", "leaseStartDate", "leaseEndDate", "monthlyRentAmount", status,
        "moveInDate", "rentDueDay", "leaseType",
        "propertyId", "organizationId"
    )
    VALUES
        -- Active Residents
        ('res_001', NOW(), NOW(), 'John', 'Smith', 'john.smith@email.com', '+12135551001', 
         '101', '2024-01-01', '2024-12-31', 2500.00, 'ACTIVE', '2024-01-01', 1, 'ONE_YEAR', 'prop_001', org_id),
        
        ('res_002', NOW(), NOW(), 'Sarah', 'Johnson', 'sarah.j@email.com', '+12135551002',
         '102', '2024-02-01', '2025-01-31', 2600.00, 'ACTIVE', '2024-02-01', 1, 'ONE_YEAR', 'prop_001', org_id),
        
        ('res_003', NOW(), NOW(), 'Michael', 'Williams', 'mwilliams@email.com', '+12135551003',
         '201', '2024-03-01', '2025-02-28', 2700.00, 'ACTIVE', '2024-03-01', 1, 'ONE_YEAR', 'prop_001', org_id),
        
        ('res_004', NOW(), NOW(), 'Emily', 'Brown', 'emily.brown@email.com', '+12135551004',
         '202', '2023-06-01', '2024-05-31', 2400.00, 'ACTIVE', '2023-06-01', 1, 'ONE_YEAR', 'prop_001', org_id),
        
        -- Leases expiring soon (within 60 days)
        ('res_005', NOW(), NOW(), 'David', 'Martinez', 'dmartinez@email.com', '+12135551005',
         '301', '2023-12-01', '2024-11-30', 2550.00, 'ACTIVE', '2023-12-01', 1, 'ONE_YEAR', 'prop_001', org_id),
        
        ('res_006', NOW(), NOW(), 'Lisa', 'Garcia', 'lisa.garcia@email.com', '+12135551006',
         'A1', '2024-01-15', '2024-12-14', 3200.00, 'ACTIVE', '2024-01-15', 1, 'ONE_YEAR', 'prop_002', org_id),
        
        ('res_007', NOW(), NOW(), 'Robert', 'Rodriguez', 'rrodriguez@email.com', '+12135551007',
         'A2', '2024-02-01', '2025-01-31', 3100.00, 'ACTIVE', '2024-02-01', 1, 'ONE_YEAR', 'prop_002', org_id),
        
        ('res_008', NOW(), NOW(), 'Jennifer', 'Wilson', 'jwilson@email.com', '+12135551008',
         'B1', '2024-03-15', '2025-02-14', 3300.00, 'ACTIVE', '2024-03-15', 1, 'ONE_YEAR', 'prop_002', org_id),
        
        ('res_009', NOW(), NOW(), 'James', 'Anderson', 'janderson@email.com', '+12135551009',
         'Unit 1', '2023-09-01', '2024-08-31', 4500.00, 'ACTIVE', '2023-09-01', 1, 'ONE_YEAR', 'prop_003', org_id),
        
        ('res_010', NOW(), NOW(), 'Mary', 'Thomas', 'mthomas@email.com', '+12135551010',
         'Unit 2', '2024-01-01', '2024-12-31', 4600.00, 'ACTIVE', '2024-01-01', 1, 'ONE_YEAR', 'prop_003', org_id),
        
        -- Past residents (moved out)
        ('res_011', NOW(), NOW(), 'William', 'Taylor', 'wtaylor@email.com', '+12135551011',
         '103', '2023-01-01', '2023-12-31', 2300.00, 'PAST_RESIDENT', '2023-01-01', 1, 'ONE_YEAR', 'prop_001', org_id),
        
        ('res_012', NOW(), NOW(), 'Patricia', 'Moore', 'pmoore@email.com', '+12135551012',
         'A3', '2023-03-01', '2024-02-29', 3000.00, 'PAST_RESIDENT', '2023-03-01', 1, 'ONE_YEAR', 'prop_002', org_id);

    -- =============================================
    -- PHASE 5: LEADS
    -- =============================================

    -- Create Leads across different statuses
    INSERT INTO "Lead" (
        id, "createdAt", "updatedAt", "firstName", "lastName", email, "phoneNumber",
        status, "leadSource", notes, "interestedPropertyId", "organizationId", priority
    )
    VALUES
        -- NEW leads
        ('lead_001', NOW(), NOW(), 'Alex', 'Cooper', 'alex.cooper@email.com', '+12135552001',
         'NEW', 'WEBSITE', 'Interested in 2BR unit', 'prop_001', org_id, 'WARM'),
        
        ('lead_002', NOW(), NOW(), 'Jessica', 'Lee', 'jlee@email.com', '+12135552002',
         'NEW', 'REFERRAL', 'Looking for pet-friendly apartment', 'prop_002', org_id, 'WARM'),
        
        ('lead_003', NOW(), NOW(), 'Daniel', 'White', 'dwhite@email.com', '+12135552003',
         'NEW', 'OTHER', 'Needs to move by next month', 'prop_001', org_id, 'HOT'),
        
        -- CONTACTED leads
        ('lead_004', NOW(), NOW(), 'Amanda', 'Harris', 'aharris@email.com', '+12135552004',
         'CONTACTED', 'WEBSITE', 'Called back, interested in viewing', 'prop_002', org_id, 'HOT'),
        
        ('lead_005', NOW(), NOW(), 'Christopher', 'Clark', 'cclark@email.com', '+12135552005',
         'CONTACTED', 'PHONE', 'Left voicemail, waiting for response', 'prop_003', org_id, 'WARM'),
        
        -- TOURING_SCHEDULED leads
        ('lead_006', NOW(), NOW(), 'Nicole', 'Lewis', 'nlewis@email.com', '+12135552006',
         'TOURING_SCHEDULED', 'WEBSITE', 'Budget: $3000-3500, Move-in: 30 days', 'prop_002', org_id, 'HOT'),
        
        ('lead_007', NOW(), NOW(), 'Kevin', 'Walker', 'kwalker@email.com', '+12135552007',
         'TOURING_SCHEDULED', 'REFERRAL', 'Excellent credit score, stable income', 'prop_001', org_id, 'HOT'),
        
        -- TOURED leads
        ('lead_008', NOW(), NOW(), 'Michelle', 'Hall', 'mhall@email.com', '+12135552008',
         'TOURED', 'OTHER', 'Toured yesterday, very interested', 'prop_002', org_id, 'HOT'),
        
        ('lead_009', NOW(), NOW(), 'Ryan', 'Allen', 'rallen@email.com', '+12135552009',
         'TOURED', 'WEBSITE', 'Toured this weekend, considering options', 'prop_001', org_id, 'WARM'),
        
        -- APPLIED leads
        ('lead_010', NOW(), NOW(), 'Stephanie', 'Young', 'syoung@email.com', '+12135552010',
         'APPLIED', 'REFERRAL', 'Application submitted, checking references', 'prop_002', org_id, 'HOT'),
        
        ('lead_011', NOW(), NOW(), 'Brandon', 'King', 'bking@email.com', '+12135552011',
         'APPLIED', 'WEBSITE', 'Application under review', 'prop_003', org_id, 'HOT'),
        
        -- APPROVED leads (ready to convert to residents)
        ('lead_012', NOW(), NOW(), 'Rachel', 'Wright', 'rwright@email.com', '+12135552012',
         'APPROVED', 'OTHER', 'Approved! Lease signing scheduled', 'prop_001', org_id, 'HOT'),
        
        ('lead_013', NOW(), NOW(), 'Justin', 'Lopez', 'jlopez@email.com', '+12135552013',
         'APPROVED', 'WEBSITE', 'Background check passed, ready for lease', 'prop_002', org_id, 'HOT'),
        
        -- LOST leads
        ('lead_014', NOW(), NOW(), 'Melissa', 'Hill', 'mhill@email.com', '+12135552014',
         'LOST', 'PHONE', 'Failed credit check', 'prop_001', org_id, 'COLD'),
        
        ('lead_015', NOW(), NOW(), 'Eric', 'Scott', 'escott@email.com', '+12135552015',
         'LOST', 'WEBSITE', 'Insufficient income verification', 'prop_002', org_id, 'COLD');

    -- =============================================
    -- PHASE 6: MAINTENANCE REQUESTS (for Resident detail page)
    -- =============================================

    INSERT INTO "MaintenanceRequest" (
        id, "createdAt", "updatedAt", title, description, priority, status,
        "residentId", "propertyId", "organizationId", "unitNumber", "requestType"
    )
    VALUES
        ('maint_001', NOW(), NOW(), 'Leaky Faucet', 'Kitchen faucet dripping constantly', 'MEDIUM', 'SUBMITTED',
         'res_001', 'prop_001', org_id, '101', 'PLUMBING'),
        
        ('maint_002', NOW(), NOW(), 'AC Not Working', 'Air conditioning not cooling properly', 'HIGH', 'IN_PROGRESS',
         'res_002', 'prop_001', org_id, '102', 'HVAC'),
        
        ('maint_003', NOW(), NOW(), 'Broken Window', 'Bedroom window cracked', 'HIGH', 'SUBMITTED',
         'res_003', 'prop_001', org_id, '201', 'GENERAL'),
        
        ('maint_004', NOW(), NOW(), 'Light Fixture', 'Bathroom light not working', 'LOW', 'COMPLETED',
         'res_004', 'prop_001', org_id, '202', 'ELECTRICAL'),
        
        ('maint_005', NOW(), NOW(), 'Dishwasher Issue', 'Dishwasher not draining', 'MEDIUM', 'SUBMITTED',
         'res_006', 'prop_002', org_id, 'A1', 'APPLIANCE'),
        
        ('maint_006', NOW(), NOW(), 'Parking Gate', 'Parking gate remote not working', 'LOW', 'SUBMITTED',
         'res_009', 'prop_003', org_id, 'Unit 1', 'SECURITY');

    -- =============================================
    -- PHASE 7: PURCHASE ORDERS
    -- =============================================

    -- Draft PO (not submitted yet)
    INSERT INTO "PurchaseOrder" (
        id, "createdAt", "updatedAt", "poNumber", vendor, description, "totalAmount",
        status, "expenseTypeId", "createdById", "organizationId", "isTemplate"
    )
    VALUES
        ('po_001', NOW(), NOW(), 'PO-2024-001', 'ABC Plumbing Inc',
         'Emergency plumbing repairs for unit 101', 450.00, 'DRAFT',
         'exp_001', pm_user_id, org_id, false);

    INSERT INTO "POLineItem" (
        id, "createdAt", "updatedAt", description, quantity, "unitPrice", "totalAmount", "lineNumber",
        "purchaseOrderId", "propertyId", "glAccountId"
    )
    VALUES
        ('poli_001', NOW(), NOW(), 'Pipe replacement parts', 1, 150.00, 150.00, 1,
         'po_001', 'prop_001', 'gl_001'),
        ('poli_002', NOW(), NOW(), 'Labor - 3 hours', 3, 100.00, 300.00, 2,
         'po_001', 'prop_001', 'gl_001');

    -- Pending Approval PO
    INSERT INTO "PurchaseOrder" (
        id, "createdAt", "updatedAt", "poNumber", vendor, description, "totalAmount",
        status, "expenseTypeId", "createdById", "organizationId", "isTemplate", "requiresApproval"
    )
    VALUES
        ('po_002', NOW(), NOW(), 'PO-2024-002', 'Green Lawn Services',
         'Monthly landscaping service', 800.00, 'PENDING_APPROVAL',
         'exp_006', pm_user_id, org_id, false, true);

    INSERT INTO "POLineItem" (
        id, "createdAt", "updatedAt", description, quantity, "unitPrice", "totalAmount", "lineNumber",
        "purchaseOrderId", "propertyId", "glAccountId"
    )
    VALUES
        ('poli_003', NOW(), NOW(), 'Lawn mowing and edging', 1, 400.00, 400.00, 1,
         'po_002', 'prop_001', 'gl_003'),
        ('poli_004', NOW(), NOW(), 'Fertilization and weed control', 1, 400.00, 400.00, 2,
         'po_002', 'prop_001', 'gl_003');

    -- Create approval step for pending PO
    INSERT INTO "ApprovalStep" (
        id, "createdAt", "updatedAt", "stepNumber", "stepName", "requiredRole", status,
        "purchaseOrderId"
    )
    VALUES
        ('appr_001', NOW(), NOW(), 1, 'Accounting Approval', 'ACCOUNTING', 'PENDING', 'po_002');

    -- Approved PO (ready for invoice matching)
    INSERT INTO "PurchaseOrder" (
        id, "createdAt", "updatedAt", "poNumber", vendor, description, "totalAmount",
        status, "expenseTypeId", "createdById", "organizationId", "isTemplate"
    )
    VALUES
        ('po_003', NOW(), NOW(), 'PO-2024-003', 'Cool Air HVAC',
         'HVAC maintenance and filter replacement', 350.00, 'APPROVED',
         'exp_002', pm_user_id, org_id, false);

    INSERT INTO "POLineItem" (
        id, "createdAt", "updatedAt", description, quantity, "unitPrice", "totalAmount", "lineNumber",
        "purchaseOrderId", "propertyId", "glAccountId"
    )
    VALUES
        ('poli_005', NOW(), NOW(), 'HVAC inspection and service', 1, 250.00, 250.00, 1,
         'po_003', 'prop_002', 'gl_001'),
        ('poli_006', NOW(), NOW(), 'Air filter replacement (4 units)', 4, 25.00, 100.00, 2,
         'po_003', 'prop_002', 'gl_001');

    -- Create approval step history
    INSERT INTO "ApprovalStep" (
        id, "createdAt", "updatedAt", "stepNumber", "stepName", "requiredRole", status,
        "approvedById", "approvedAt",
        "purchaseOrderId"
    )
    VALUES
        ('appr_002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 
         1, 'Accounting Approval', 'ACCOUNTING', 'APPROVED',
         accounting_user_id, NOW() - INTERVAL '2 days',
         'po_003');

    INSERT INTO "ApprovalAction" (
        id, "createdAt", "userId", "purchaseOrderId", "stepNumber", action, comment
    )
    VALUES
        ('appact_001', NOW() - INTERVAL '2 days', accounting_user_id, 'po_003', 1,
         'APPROVED', 'Approved - within budget');

    -- Another Approved PO for testing
    INSERT INTO "PurchaseOrder" (
        id, "createdAt", "updatedAt", "poNumber", vendor, description, "totalAmount",
        status, "expenseTypeId", "createdById", "organizationId", "isTemplate"
    )
    VALUES
        ('po_004', NOW(), NOW(), 'PO-2024-004', 'City Water Utility',
         'Monthly water service - October 2024', 1200.00, 'APPROVED',
         'exp_004', pm_user_id, org_id, false);

    INSERT INTO "POLineItem" (
        id, "createdAt", "updatedAt", description, quantity, "unitPrice", "totalAmount", "lineNumber",
        "purchaseOrderId", "propertyId", "glAccountId"
    )
    VALUES
        ('poli_007', NOW(), NOW(), 'Water usage - 50 units', 1, 1200.00, 1200.00, 1,
         'po_004', 'prop_001', 'gl_002');

    INSERT INTO "ApprovalStep" (
        id, "createdAt", "updatedAt", "stepNumber", "stepName", "requiredRole", status,
        "approvedById", "approvedAt",
        "purchaseOrderId"
    )
    VALUES
        ('appr_003', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days',
         1, 'Accounting Approval', 'ACCOUNTING', 'APPROVED',
         accounting_user_id, NOW() - INTERVAL '4 days',
         'po_004');

    INSERT INTO "ApprovalAction" (
        id, "createdAt", "userId", "purchaseOrderId", "stepNumber", action, comment
    )
    VALUES
        ('appact_002', NOW() - INTERVAL '4 days', accounting_user_id, 'po_004', 1,
         'APPROVED', 'Regular utility expense');

    -- Template PO (for recurring purchases)
    INSERT INTO "PurchaseOrder" (
        id, "createdAt", "updatedAt", "poNumber", vendor, description, "totalAmount",
        status, "expenseTypeId", "createdById", "organizationId", "isTemplate", "templateName"
    )
    VALUES
        ('po_template_001', NOW(), NOW(), 'TEMPLATE', 'Monthly Lawn Service Template',
         'Standard monthly lawn care package', 800.00, 'DRAFT',
         'exp_006', pm_user_id, org_id, true, 'Monthly Lawn Care');

    INSERT INTO "POLineItem" (
        id, "createdAt", "updatedAt", description, quantity, "unitPrice", "totalAmount", "lineNumber",
        "purchaseOrderId", "propertyId", "glAccountId"
    )
    VALUES
        ('poli_template_001', NOW(), NOW(), 'Lawn mowing and edging', 1, 400.00, 400.00, 1,
         'po_template_001', 'prop_001', 'gl_003'),
        ('poli_template_002', NOW(), NOW(), 'Fertilization and weed control', 1, 400.00, 400.00, 2,
         'po_template_001', 'prop_001', 'gl_003');

    -- =============================================
    -- PHASE 9: CONVERSATIONS (for Communications tab)
    -- =============================================

    -- Conversations for Resident #1 (res_001)
    INSERT INTO "Conversation" (
        id, "createdAt", "sentAt", "messageContent", "messageType", "senderType",
        status, "aiGenerated", "aiModel",
        "residentId", "organizationId"
    )
    VALUES
        ('conv_001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
         'Hi, when will the AC be fixed?', 'SMS', 'RESIDENT',
         'DELIVERED', false, NULL,
         'res_001', org_id),
        
        ('conv_002', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days',
         'Hello John! We have scheduled the AC repair for tomorrow at 2 PM. A technician will contact you 30 minutes before arrival.',
         'SMS', 'AI_AGENT',
         'DELIVERED', true, 'gpt-4',
         'res_001', org_id),
        
        ('conv_003', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days',
         'Reminder: Your rent is due on the 1st', 'SMS', 'SYSTEM',
         'DELIVERED', false, NULL,
         'res_001', org_id),
        
        ('conv_004', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
         'The AC is working great now. Thanks!', 'SMS', 'RESIDENT',
         'DELIVERED', false, NULL,
         'res_001', org_id),
        
        ('conv_005', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
         'Wonderful! I''m glad to hear the AC is working properly now. If you need anything else, please don''t hesitate to reach out!',
         'SMS', 'AI_AGENT',
         'DELIVERED', true, 'gpt-4',
         'res_001', org_id);

    -- Conversations for Resident #2 (res_002)
    INSERT INTO "Conversation" (
        id, "createdAt", "sentAt", "messageContent", "messageType", "senderType",
        status, "aiGenerated",
        "residentId", "organizationId"
    )
    VALUES
        ('conv_006', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days',
         'Is the pool open this weekend?', 'SMS', 'RESIDENT',
         'DELIVERED', false,
         'res_002', org_id),
        
        ('conv_007', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days',
         'Hi Sarah! Yes, the pool is open this weekend from 8 AM to 8 PM. Please note that we''ll be doing some maintenance on Monday, so it will be closed that day.',
         'SMS', 'AI_AGENT',
         'DELIVERED', true,
         'res_002', org_id);

    -- Conversations for Lead #4 (contacted status)
    INSERT INTO "Conversation" (
        id, "createdAt", "sentAt", "messageContent", "messageType", "senderType",
        status, "aiGenerated", "aiModel",
        "leadId", "organizationId"
    )
    VALUES
        ('conv_008', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
         'I saw your listing online. Is the 2BR still available?', 'SMS', 'LEAD',
         'DELIVERED', false, NULL,
         'lead_004', org_id),
        
        ('conv_009', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days',
         'Hello Amanda! Yes, we have a beautiful 2BR unit available at Downtown Lofts. Would you like to schedule a showing?',
         'SMS', 'AI_AGENT',
         'DELIVERED', true, 'gpt-4',
         'lead_004', org_id),
        
        ('conv_010', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
         'Yes! Can I see it this Saturday?', 'SMS', 'LEAD',
         'DELIVERED', false, NULL,
         'lead_004', org_id),
        
        ('conv_011', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
         'Absolutely! I have you scheduled for a showing this Saturday at 11 AM. Looking forward to showing you the unit!',
         'SMS', 'AI_AGENT',
         'DELIVERED', true, 'gpt-4',
         'lead_004', org_id);

    -- Conversation for Lead #8 (showing scheduled)
    INSERT INTO "Conversation" (
        id, "createdAt", "sentAt", "messageContent", "messageType", "senderType",
        status, "aiGenerated",
        "leadId", "organizationId"
    )
    VALUES
        ('conv_012', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',
         'Reminder: Your showing at Downtown Lofts is scheduled for tomorrow at 2 PM', 
         'SMS', 'SYSTEM',
         'DELIVERED', false,
         'lead_008', org_id);

    -- =============================================
    -- NOTIFICATIONS (for approval workflows)
    -- =============================================

    INSERT INTO "Notification" (
        id, "createdAt", "updatedAt", type, title, message, read,
        "userId", "purchaseOrderId"
    )
    VALUES
        -- Notification for accounting user about pending PO
        ('notif_001', NOW(), NOW(), 'PO_APPROVAL_NEEDED', 'Purchase Order Awaiting Approval',
         'PO-2024-002 from pm@demo.com requires your approval. Amount: $800.00',
         false, accounting_user_id, 'po_002'),
        
        -- Notification for PM about approved PO
        ('notif_002', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'PO_APPROVED',
         'Purchase Order Approved',
         'Your purchase order PO-2024-003 has been approved by accounting@demo.com',
         true, pm_user_id, 'po_003');

END $$;

COMMIT;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check Properties
SELECT 'Properties:' as check_type, COUNT(*) as count FROM "Property" WHERE "organizationId" = 'org_demo_1';

-- Check GL Accounts
SELECT 'GL Accounts:' as check_type, COUNT(*) as count FROM "GLAccount" WHERE "organizationId" = 'org_demo_1';

-- Check Expense Types
SELECT 'Expense Types:' as check_type, COUNT(*) as count FROM "ExpenseType" WHERE "organizationId" = 'org_demo_1';

-- Check Residents
SELECT 'Residents:' as check_type, COUNT(*) as count, status FROM "Resident" 
WHERE "organizationId" = 'org_demo_1' GROUP BY status;

-- Check Leads by Status
SELECT 'Leads:' as check_type, status, COUNT(*) as count FROM "Lead" 
WHERE "organizationId" = 'org_demo_1' GROUP BY status ORDER BY status;

-- Check Maintenance Requests
SELECT 'Maintenance Requests:' as check_type, status, COUNT(*) as count FROM "MaintenanceRequest"
WHERE "organizationId" = 'org_demo_1' GROUP BY status;

-- Check Purchase Orders by Status
SELECT 'Purchase Orders:' as check_type, status, COUNT(*) as count FROM "PurchaseOrder"
WHERE "organizationId" = 'org_demo_1' AND "isTemplate" = false GROUP BY status;

-- Check Templates
SELECT 'PO Templates:' as check_type, COUNT(*) as count FROM "PurchaseOrder"
WHERE "organizationId" = 'org_demo_1' AND "isTemplate" = true;

-- Check Invoices (skipped - Invoice schema doesn't match test data structure)

-- Check Conversations
SELECT 'Conversations:' as check_type, "senderType", COUNT(*) as count FROM "Conversation"
WHERE "organizationId" = 'org_demo_1' GROUP BY "senderType";

-- Check Notifications
SELECT 'Notifications:' as check_type, type, COUNT(*) as count FROM "Notification"
WHERE "userId" IN (
    SELECT id FROM "User" WHERE "organizationId" = 'org_demo_1'
) GROUP BY type;

-- Summary Report
SELECT 
    'SUMMARY' as report,
    (SELECT COUNT(*) FROM "Property" WHERE "organizationId" = 'org_demo_1') as properties,
    (SELECT COUNT(*) FROM "GLAccount" WHERE "organizationId" = 'org_demo_1') as gl_accounts,
    (SELECT COUNT(*) FROM "ExpenseType" WHERE "organizationId" = 'org_demo_1') as expense_types,
    (SELECT COUNT(*) FROM "Resident" WHERE "organizationId" = 'org_demo_1') as residents,
    (SELECT COUNT(*) FROM "Lead" WHERE "organizationId" = 'org_demo_1') as leads,
    (SELECT COUNT(*) FROM "MaintenanceRequest" WHERE "organizationId" = 'org_demo_1') as maintenance_requests,
    (SELECT COUNT(*) FROM "PurchaseOrder" WHERE "organizationId" = 'org_demo_1' AND "isTemplate" = false) as purchase_orders,
    (SELECT COUNT(*) FROM "Conversation" WHERE "organizationId" = 'org_demo_1') as conversations;
