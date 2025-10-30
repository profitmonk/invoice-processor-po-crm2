UPDATE "User" 
SET 
    "isSuperAdmin" = true,
    "isAdmin" = true,
    role = 'ADMIN',
    "hasCompletedOnboarding" = true,
    credits = 500000,
    "updatedAt" = NOW()
WHERE email = 'super-admin@auradesk.ai';


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
    'super-admin@auradesk.ai'
);  
    


-- Verify it worked
SELECT 
    email,
    username,
    role,
    "isAdmin",
    "isSuperAdmin",
    "organizationId"
FROM "User" 
WHERE email = 'super-admin@auradesk.ai';
