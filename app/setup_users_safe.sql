-- setup_users_working_fixed.sql
\set target_email '''admin2@heynow.com'''

-- Step 1: Update User
UPDATE "User" 
SET 
    "isSuperAdmin" = false,
    "isAdmin" = true,
    role = 'ADMIN',
    "hasCompletedOnboarding" = true,
    credits = 500000,
    "updatedAt" = NOW()
WHERE email = :target_email;

-- Step 2: Ensure Auth record exists (fixed - remove createdAt/updatedAt)
INSERT INTO "Auth" (id, "userId")
SELECT 
    gen_random_uuid(),
    id::text
FROM "User" 
WHERE email = :target_email
AND NOT EXISTS (
    SELECT 1 FROM "Auth" WHERE "userId" = "User".id::text
);

-- Step 3: Ensure AuthIdentity record exists and is verified (fixed - use correct column names)
INSERT INTO "AuthIdentity" (
    "providerName", "providerUserId", "providerData", "authId"
)
SELECT
    'email',
    :target_email,
    '{"isEmailVerified": true}'::text,
    a.id
FROM "Auth" a
JOIN "User" u ON a."userId" = u.id::text
WHERE u.email = :target_email
ON CONFLICT ("providerName", "providerUserId") 
DO UPDATE SET 
    "providerData" = EXCLUDED."providerData";

-- Step 4: Verification
SELECT 
    'USER STATUS' as check_type,
    email,
    role,
    "isAdmin",
    "isSuperAdmin",
    credits,
    (SELECT id FROM "Auth" WHERE "userId" = "User".id::text) IS NOT NULL as has_auth,
    (SELECT 1 FROM "AuthIdentity" WHERE "authId" = (SELECT id FROM "Auth" WHERE "userId" = "User".id::text)) IS NOT NULL as has_auth_identity
FROM "User" 
WHERE email = :target_email;
