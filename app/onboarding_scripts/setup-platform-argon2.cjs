#!/usr/bin/env node
/**
 * SETUP PLATFORM - ARGON2 VERSION
 * 
 * Creates super admin using Argon2 (same as Wasp)
 * 
 * Usage:
 *   npm install argon2 pg
 *   export DATABASE_URL="postgresql://..."
 *   node setup-platform-argon2.cjs
 */

const argon2 = require('argon2');
const { Client } = require('pg');

const SUPER_ADMIN = {
  email: 'super-admin@auradesk.ai',
  username: 'super-admin',
  password: 'SuperAdmin123!',
};

async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

async function setupPlatform() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🚀 AURADESK PLATFORM SETUP (ARGON2)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const hashedPassword = await hashPassword(SUPER_ADMIN.password);
    console.log('✅ Password hashed with Argon2\n');
    
    // Create or update User
    const userResult = await client.query(`
      INSERT INTO "User" (
        id, "createdAt", "updatedAt", email, username,
        "isSuperAdmin", "isAdmin", role, "hasCompletedOnboarding",
        credits
      )
      VALUES (
        gen_random_uuid(), NOW(), NOW(), $1, $2,
        true, true, 'ADMIN', true, 1000000
      )
      ON CONFLICT (email) DO UPDATE SET
        "isSuperAdmin" = true,
        "isAdmin" = true,
        role = 'ADMIN',
        "updatedAt" = NOW()
      RETURNING id
    `, [SUPER_ADMIN.email, SUPER_ADMIN.username]);

    const userId = userResult.rows[0].id;
    console.log(`✅ Super admin user: ${SUPER_ADMIN.email}`);

    // Create Auth if doesn't exist
    const authResult = await client.query(`
      INSERT INTO "Auth" (id, "userId")
      SELECT gen_random_uuid()::text, $1::text
      WHERE NOT EXISTS (
        SELECT 1 FROM "Auth" WHERE "userId" = $1::text
      )
      RETURNING id
    `, [userId]);

    let authId;
    if (authResult.rows.length > 0) {
      authId = authResult.rows[0].id;
      console.log('✅ Auth record created');
    } else {
      const existingAuth = await client.query(
        'SELECT id FROM "Auth" WHERE "userId" = $1::text',
        [userId]
      );
      authId = existingAuth.rows[0].id;
      console.log('✅ Auth record exists');
    }

    // Create or update AuthIdentity with Argon2 hash
    const providerData = JSON.stringify({
      hashedPassword: hashedPassword,
      isEmailVerified: true,
      emailVerificationSentAt: new Date().toISOString(),
      passwordResetSentAt: null,
    });

    await client.query(`
      INSERT INTO "AuthIdentity" ("providerName", "providerUserId", "providerData", "authId")
      VALUES ('email', $1, $2::text, $3::text)
      ON CONFLICT ("providerName", "providerUserId") 
      DO UPDATE SET "providerData" = EXCLUDED."providerData"
    `, [SUPER_ADMIN.email, providerData, authId]);

    console.log('✅ AuthIdentity configured with Argon2 hash\n');

    // Verify
    const verifyResult = await client.query(`
      SELECT 
        u.email, 
        u."isSuperAdmin", 
        u."isAdmin", 
        u.role,
        (ai."providerData"::jsonb->>'isEmailVerified')::boolean as email_verified,
        substring(ai."providerData"::jsonb->>'hashedPassword', 1, 20) as hash_preview
      FROM "User" u
      LEFT JOIN "Auth" a ON a."userId" = u.id::text
      LEFT JOIN "AuthIdentity" ai ON ai."authId" = a.id
      WHERE u.email = $1
    `, [SUPER_ADMIN.email]);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 PLATFORM SETUP COMPLETE! 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔑 SUPER ADMIN CREDENTIALS:');
    console.log(`   Email:    ${SUPER_ADMIN.email}`);
    console.log(`   Password: ${SUPER_ADMIN.password}`);
    console.log('');
    
    if (verifyResult.rows[0]) {
      console.log('✅ VERIFICATION:');
      console.log(`   Super Admin: ${verifyResult.rows[0].isSuperAdmin}`);
      console.log(`   Admin: ${verifyResult.rows[0].isAdmin}`);
      console.log(`   Email Verified: ${verifyResult.rows[0].email_verified}`);
      console.log(`   Hash Type: ${verifyResult.rows[0].hash_preview.startsWith('$argon2id$') ? 'Argon2 ✅' : 'Other ⚠️'}`);
      console.log('');
    }
    
    console.log('⚠️  IMPORTANT:');
    console.log('   1. Change this password after first login!');
    console.log('   2. Restart your Fly.io app:');
    console.log('      fly apps restart my-invoice-po-crm-app-server\n');

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Restart app (see above)');
    console.log('   2. Clear browser cache');
    console.log('   3. Try logging in!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupPlatform();
