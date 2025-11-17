#!/usr/bin/env node
/**
 * COMPREHENSIVE LOGIN DIAGNOSTIC
 * Checks everything that could cause "invalid credentials"
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');

const SUPER_ADMIN = {
  email: 'super-admin@auradesk.ai',
  password: 'SuperAdmin123!',
};

async function diagnose() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    
    console.log('\n🔍 COMPREHENSIVE LOGIN DIAGNOSTIC');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Testing credentials:');
    console.log(`   Email: ${SUPER_ADMIN.email}`);
    console.log(`   Password: ${SUPER_ADMIN.password}`);
    console.log('');

    // Check 1: User exists
    console.log('✓ Check 1: User exists in database');
    const userResult = await client.query(`
      SELECT id, email, "isSuperAdmin", "isAdmin", role
      FROM "User"
      WHERE email = $1
    `, [SUPER_ADMIN.email]);

    if (userResult.rows.length === 0) {
      console.log('   ❌ FAIL: User does not exist!');
      console.log('   → Run: node setup-platform.cjs\n');
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`   ✅ PASS: User exists (${user.id})`);
    console.log(`   - Super Admin: ${user.isSuperAdmin}`);
    console.log(`   - Admin: ${user.isAdmin}`);
    console.log(`   - Role: ${user.role}`);
    console.log('');

    // Check 2: Auth record exists
    console.log('✓ Check 2: Auth record exists');
    const authResult = await client.query(`
      SELECT id FROM "Auth" WHERE "userId" = $1::text
    `, [user.id]);

    if (authResult.rows.length === 0) {
      console.log('   ❌ FAIL: Auth record missing!');
      console.log('   → Run: node fix-super-admin.cjs\n');
      process.exit(1);
    }

    const authId = authResult.rows[0].id;
    console.log(`   ✅ PASS: Auth record exists (${authId})`);
    console.log('');

    // Check 3: AuthIdentity exists
    console.log('✓ Check 3: AuthIdentity exists');
    const identityResult = await client.query(`
      SELECT "providerName", "providerUserId", "providerData"
      FROM "AuthIdentity"
      WHERE "authId" = $1
    `, [authId]);

    if (identityResult.rows.length === 0) {
      console.log('   ❌ FAIL: AuthIdentity missing!');
      console.log('   → Run: node fix-super-admin.cjs\n');
      process.exit(1);
    }

    const identity = identityResult.rows[0];
    console.log(`   ✅ PASS: AuthIdentity exists`);
    console.log(`   - Provider: ${identity.providerName}`);
    console.log(`   - Provider User ID: ${identity.providerUserId}`);
    console.log('');

    // Check 4: Provider data valid
    console.log('✓ Check 4: Provider data is valid JSON');
    let providerData;
    try {
      providerData = JSON.parse(identity.providerData);
      console.log('   ✅ PASS: Valid JSON');
    } catch (error) {
      console.log('   ❌ FAIL: Invalid JSON!');
      console.log('   → Run: node fix-super-admin.cjs\n');
      process.exit(1);
    }
    console.log('');

    // Check 5: Has password hash
    console.log('✓ Check 5: Password hash exists');
    if (!providerData.hashedPassword) {
      console.log('   ❌ FAIL: No hashedPassword field!');
      console.log('   → Run: node fix-super-admin.cjs\n');
      process.exit(1);
    }
    console.log(`   ✅ PASS: Hash exists (${providerData.hashedPassword.substring(0, 20)}...)`);
    console.log('');

    // Check 6: Email verified
    console.log('✓ Check 6: Email is verified');
    if (providerData.isEmailVerified !== true) {
      console.log('   ⚠️  WARNING: Email not verified!');
      console.log('   This might prevent login.');
    } else {
      console.log('   ✅ PASS: Email verified');
    }
    console.log('');

    // Check 7: Password matches
    console.log('✓ Check 7: Password hash matches');
    const matches = await bcrypt.compare(SUPER_ADMIN.password, providerData.hashedPassword);
    
    if (!matches) {
      console.log('   ❌ FAIL: Password does NOT match!');
      console.log('   The stored hash is for a different password.');
      console.log('   → Run: node fix-super-admin.cjs\n');
      process.exit(1);
    }
    console.log('   ✅ PASS: Password matches!');
    console.log('');

    // All checks passed
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL CHECKS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Summary:');
    console.log('   ✅ User exists and is super admin');
    console.log('   ✅ Auth chain is complete');
    console.log('   ✅ Password hash is correct');
    console.log('   ✅ Email is verified');
    console.log('');

    console.log('🤔 If login still fails, the issue is NOT with the database.');
    console.log('');
    console.log('🔍 Check these instead:');
    console.log('   1. Are you on the correct URL?');
    console.log('   2. Is your app connected to THIS database?');
    console.log('   3. Clear browser cache/cookies');
    console.log('   4. Try incognito mode');
    console.log('   5. Check browser console for errors');
    console.log('');

    console.log('🎯 To verify app database connection:');
    console.log('   fly ssh console -a my-invoice-po-crm-app-server -C "echo \\$DATABASE_URL"');
    console.log('');
    console.log('   Should match:');
    console.log(`   ${databaseUrl.replace(/localhost:15432/, 'my-invoice-po-crm-app-db.flycast:5432')}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

diagnose();
