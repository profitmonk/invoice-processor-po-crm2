#!/usr/bin/env node
/**
 * Test if stored hash matches password
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function testPassword() {
  const databaseUrl = process.env.DATABASE_URL;
  const testPassword = 'SuperAdmin123!';
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    
    console.log('\n🔐 PASSWORD HASH TEST\n');
    console.log('Testing password:', testPassword);
    console.log('');

    // Get the stored hash
    const result = await client.query(`
      SELECT "providerData"
      FROM "AuthIdentity"
      WHERE "providerUserId" = 'super-admin@auradesk.ai'
    `);

    if (result.rows.length === 0) {
      console.error('❌ No AuthIdentity found!');
      process.exit(1);
    }

    const providerData = JSON.parse(result.rows[0].providerData);
    const storedHash = providerData.hashedPassword;

    console.log('Stored hash:', storedHash);
    console.log('');

    // Test if password matches
    const matches = await bcrypt.compare(testPassword, storedHash);

    if (matches) {
      console.log('✅ PASSWORD MATCHES! Hash is correct!');
      console.log('');
      console.log('The hash is working. Login issue is something else.');
      console.log('');
      console.log('🔍 Possible issues:');
      console.log('   1. Case sensitive email (try lowercase)');
      console.log('   2. Session/cookie issue (clear browser cache)');
      console.log('   3. Wrong login URL');
      console.log('   4. Frontend not connected to right database');
    } else {
      console.log('❌ PASSWORD DOES NOT MATCH!');
      console.log('');
      console.log('The stored hash is for a DIFFERENT password.');
      console.log('');
      console.log('🔧 Run fix-super-admin.cjs to regenerate hash.');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testPassword();
