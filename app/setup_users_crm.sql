-- Safest - only delete demo users
-- DELETE FROM "User" WHERE email LIKE '%@demo.com';
-- Manually sign up the users [accounting@demo.com,corporate@demo.com,pm@demo.com,admin@demo.com]
-- =============================================
-- ORGANIZATION SETUP & USER ROLE ASSIGNMENT SCRIPT
-- For existing users created via app signup
-- =============================================

-- Start transaction
BEGIN;

-- Step 1: Create Organization with ALL required fields
INSERT INTO "Organization" (
    id, 
    "createdAt",
    "updatedAt", 
    name,
    code,  -- Required field
    "poApprovalThreshold",  -- Required field
    "aiAgentEnabled",  -- Required field
    "communicationSetup",  -- Required field
    "dailySMSUsed",  -- Required field
    "monthlySmsCost",  -- Required field
    "smsCreditsUsed",  -- Required field
    "smsEnabled",  -- Required field
    "voiceEnabled",  -- Required field
    "businessHoursEnd",
    "businessHoursStart", 
    "campaignStatus",
    "campaignUseCase",
    "timezone",
    "setupCompletedAt"
) VALUES (
    'org_demo_1',
    NOW(),
    NOW(),
    'Demo Organization',
    'DEMO001',  -- Unique organization code
    500,        -- poApprovalThreshold
    true,       -- aiAgentEnabled
    true,       -- communicationSetup
    0,          -- dailySMSUsed
    0,          -- monthlySmsCost  
    0,          -- smsCreditsUsed
    false,      -- smsEnabled
    false,      -- voiceEnabled
    '17:00',    -- businessHoursEnd
    '09:00',    -- businessHoursStart
    'NOT_REGISTERED',  -- campaignStatus
    'CUSTOMER_CARE',   -- campaignUseCase
    'UTC',      -- timezone
    NOW()       -- setupCompletedAt
);

-- Step 2: Assign Users to Organization and Set Roles
UPDATE "User" 
SET 
    "organizationId" = 'org_demo_1',
    role = 'ADMIN',
    "isAdmin" = true,
    "hasCompletedOnboarding" = true,
    credits = 100
WHERE email = 'admin@demo.com';

UPDATE "User" 
SET 
    "organizationId" = 'org_demo_1',
    role = 'PROPERTY_MANAGER',
    "hasCompletedOnboarding" = true, 
    credits = 50
WHERE email = 'pm@demo.com';

UPDATE "User" 
SET 
    "organizationId" = 'org_demo_1',
    role = 'ACCOUNTING',
    "hasCompletedOnboarding" = true,
    credits = 50
WHERE email = 'accounting@demo.com';

UPDATE "User" 
SET 
    "organizationId" = 'org_demo_1',
    role = 'CORPORATE',
    "hasCompletedOnboarding" = true,
    credits = 50
WHERE email = 'corporate@demo.com';

-- Step 3: Override Email Verification
UPDATE "AuthIdentity" 
SET "providerData" = 
    regexp_replace(
        "providerData"::text, 
        '"isEmailVerified":false', 
        '"isEmailVerified":true', 
        'g'
    )::text
WHERE "providerUserId" IN (
    'admin@demo.com', 
    'pm@demo.com', 
    'accounting@demo.com', 
    'corporate@demo.com'
);

-- Commit everything
COMMIT;

-- Verification Query
SELECT 
    u.email,
    u.role,
    u."isAdmin" as admin,
    u.credits,
    o.name as organization,
    (ai."providerData"::json->>'isEmailVerified')::boolean as email_verified
FROM "User" u
JOIN "Organization" o ON u."organizationId" = o.id
JOIN "Auth" a ON u.id = a."userId"
JOIN "AuthIdentity" ai ON a.id = ai."authId"
WHERE u.email IN ('admin@demo.com', 'pm@demo.com', 'accounting@demo.com', 'corporate@demo.com')
ORDER BY u.role;
