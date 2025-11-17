#!/usr/bin/env node
/**
 * ONBOARD ORGANIZATION - JSON CONFIG DRIVEN
 * 
 * Everything configured via JSON file:
 * - Organization details
 * - Properties
 * - Users
 * - Residents
 * - Maintenance requests
 * 
 * Usage:
 *   npm install argon2 pg
 *   export DATABASE_URL="postgresql://..."
 *   node onboard-json.cjs config.json
 * 
 * Or modify existing org:
 *   node onboard-json.cjs update-config.json
 */

const argon2 = require('argon2');
const { Client } = require('pg');
const fs = require('fs');

async function hashPassword(password) {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

function generateCode(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
}

async function onboardFromJSON() {
  const startTime = Date.now();
  
  // Get JSON file from command line
  const configFile = process.argv[2];
  if (!configFile) {
    console.error('❌ Usage: node onboard-json.cjs <config.json>');
    console.log('\nExample:');
    console.log('  node onboard-json.cjs customer-config.json');
    process.exit(1);
  }

  if (!fs.existsSync(configFile)) {
    console.error(`❌ Config file not found: ${configFile}`);
    process.exit(1);
  }

  // Load config
  let config;
  try {
    const configContent = fs.readFileSync(configFile, 'utf8');
    config = JSON.parse(configContent);
  } catch (error) {
    console.error('❌ Error parsing JSON:', error.message);
    process.exit(1);
  }

  // Validate required fields
  if (!config.mode) {
    console.error('❌ ERROR: "mode" field is required in JSON config!');
    console.log('\nYou must specify:');
    console.log('  "mode": "create"  - To create a new organization');
    console.log('  "mode": "update"  - To update existing organization\n');
    console.log('Example:');
    console.log('{');
    console.log('  "mode": "update",');
    console.log('  "organization": { ... }');
    console.log('}\n');
    process.exit(1);
  }

  if (config.mode !== 'create' && config.mode !== 'update') {
    console.error(`❌ ERROR: Invalid mode "${config.mode}"`);
    console.log('\nValid modes:');
    console.log('  "create" - Create new organization');
    console.log('  "update" - Update existing organization\n');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  const stats = {
    organizations: 0,
    properties: 0,
    users: 0,
    residents: 0,
    maintenanceTickets: 0,
  };

  try {
    await client.connect();
    console.log('\n🚀 AURADESK ORGANIZATION ONBOARDING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📋 Config file: ${configFile}`);
    console.log(`🏢 Organization: ${config.organization.name}`);
    
    // Display mode
    if (config.mode === 'create') {
      console.log(`⚠️  Mode: CREATE (will fail if org exists)`);
    } else {
      console.log(`ℹ️  Mode: UPDATE (will update if exists, create if not)`);
    }
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // STEP 1: Create or Update Organization
    console.log('🏢 Step 1: Organization setup...');
    
    const mode = config.mode; // Required field, already validated
    const orgCode = config.organization.code || generateCode(config.organization.name);
    
    // Check if org exists by code OR name
    const existingOrg = await client.query(
      'SELECT id, code, name FROM "Organization" WHERE code = $1 OR name = $2',
      [orgCode, config.organization.name]
    );

    let orgId;
    
    if (existingOrg.rows.length > 0) {
      // Organization exists
      const existing = existingOrg.rows[0];
      
      if (mode === 'create') {
        // Mode is CREATE but org exists - ERROR
        console.error(`\n❌ ERROR: Organization already exists!`);
        console.error(`   Existing: "${existing.name}" (code: ${existing.code})`);
        console.error(`   Your config: "${config.organization.name}" (code: ${orgCode})`);
        console.error('');
        console.error('🔧 To fix this:');
        console.error('   1. If you want to UPDATE existing org:');
        console.error('      Remove "mode": "create" from JSON (or set to "update")');
        console.error('');
        console.error('   2. If you want to CREATE a NEW org:');
        console.error('      Change BOTH name AND code to be unique:');
        console.error(`      "name": "Sunset Apartments - Location 2"`);
        console.error(`      "code": "SUNSET2"`);
        console.error('');
        process.exit(1);
      }
      
      // Mode is UPDATE - proceed with update
      orgId = existing.id;
      
      await client.query(`
        UPDATE "Organization" SET
          name = $1,
          code = $2,
          "businessEmail" = $3,
          "businessPhone" = $4,
          timezone = $5,
          "updatedAt" = NOW()
        WHERE id = $6
      `, [
        config.organization.name,
        orgCode,
        config.organization.businessEmail || null,
        config.organization.businessPhone || null,
        config.organization.timezone || 'America/Los_Angeles',
        orgId
      ]);
      
      if (existing.name !== config.organization.name || existing.code !== orgCode) {
        console.log(`   ⚠️  Updated existing organization:`);
        console.log(`      Old: ${existing.name} (${existing.code})`);
        console.log(`      New: ${config.organization.name} (${orgCode})`);
      } else {
        console.log(`   ✅ Updated existing: ${config.organization.name} (${orgCode})`);
      }
    } else {
      // Organization doesn't exist - create it
      const newOrg = await client.query(`
        INSERT INTO "Organization" (
          id, "createdAt", "updatedAt", name, code,
          "businessEmail", "businessPhone", timezone,
          "isActive", "setupCompleted"
        )
        VALUES (
          gen_random_uuid(), NOW(), NOW(), $1, $2, $3, $4, $5, true, true
        )
        RETURNING id
      `, [
        config.organization.name,
        orgCode,
        config.organization.businessEmail || null,
        config.organization.businessPhone || null,
        config.organization.timezone || 'America/Los_Angeles'
      ]);
      orgId = newOrg.rows[0].id;
      console.log(`   ✅ Created new: ${config.organization.name} (${orgCode})`);
      stats.organizations = 1;
    }
    console.log('');

    // STEP 2: Create or Update Properties
    if (config.properties && config.properties.length > 0) {
      console.log('🏘️  Step 2: Properties setup...');
      
      const propertyIds = [];
      for (const prop of config.properties) {
        const propCode = prop.code || `${orgCode}${String(propertyIds.length + 1).padStart(2, '0')}`;
        
        // Check if property exists by code OR name within this org
        const existingProp = await client.query(
          'SELECT id, code, name FROM "Property" WHERE "organizationId" = $1 AND (code = $2 OR name = $3)',
          [orgId, propCode, prop.name]
        );

        if (existingProp.rows.length > 0) {
          // Update existing property
          const propId = existingProp.rows[0].id;
          const existingName = existingProp.rows[0].name;
          const existingCode = existingProp.rows[0].code;
          
          await client.query(`
            UPDATE "Property" SET
              name = $1,
              code = $2,
              address = $3,
              city = $4,
              state = $5,
              "zipCode" = $6,
              "updatedAt" = NOW()
            WHERE id = $7
          `, [
            prop.name,
            propCode,
            prop.address || null,
            prop.city || null,
            prop.state || null,
            prop.zipCode || null,
            propId
          ]);
          propertyIds.push(propId);
          
          if (existingName !== prop.name || existingCode !== propCode) {
            console.log(`   ⚠️  Updated existing property:`);
            console.log(`      Old: ${existingName} (${existingCode})`);
            console.log(`      New: ${prop.name} (${propCode})`);
          } else {
            console.log(`   ✅ Updated: ${prop.name}`);
          }
        } else {
          // Create new property
          const newProp = await client.query(`
            INSERT INTO "Property" (
              id, "createdAt", "updatedAt", "organizationId",
              code, name, address, city, state, "zipCode", "isActive"
            )
            VALUES (
              gen_random_uuid(), NOW(), NOW(), $1, $2, $3, $4, $5, $6, $7, true
            )
            RETURNING id
          `, [
            orgId, propCode, prop.name,
            prop.address || null,
            prop.city || null,
            prop.state || null,
            prop.zipCode || null
          ]);
          propertyIds.push(newProp.rows[0].id);
          console.log(`   ✅ Created: ${prop.name}`);
          stats.properties++;
        }
      }
      console.log('');
      
      // Store property IDs for later use
      config._propertyIds = propertyIds;
    }

    // STEP 3: Create or Update Users
    if (config.users && config.users.length > 0) {
      console.log('👥 Step 3: Users setup...');
      
      for (const user of config.users) {
        // Check if user exists
        const existingUser = await client.query(
          'SELECT id, "isAdmin", role FROM "User" WHERE email = $1',
          [user.email]
        );

        let userId;
        if (existingUser.rows.length > 0) {
          // Update existing user
          userId = existingUser.rows[0].id;
          const wasAdmin = existingUser.rows[0].isAdmin;
          const oldRole = existingUser.rows[0].role;
          const newIsAdmin = user.isAdmin || false;
          const newRole = user.role || 'USER';
          
          await client.query(`
            UPDATE "User" SET
              username = $1,
              "organizationId" = $2,
              "isAdmin" = $3,
              role = $4,
              "updatedAt" = NOW()
            WHERE id = $5
          `, [
            user.username || user.email.split('@')[0],
            orgId,
            newIsAdmin,
            newRole,
            userId
          ]);
          
          // Update password if provided in JSON (optional)
          if (user.password && user.updatePassword !== false) {
            const hashedPassword = await hashPassword(user.password);
            const providerData = JSON.stringify({
              hashedPassword: hashedPassword,
              isEmailVerified: user.emailVerified !== false,
              emailVerificationSentAt: new Date().toISOString(),
              passwordResetSentAt: null,
            });
            
            await client.query(`
              UPDATE "AuthIdentity" SET
                "providerData" = $1::text
              WHERE "providerName" = 'email' AND "providerUserId" = $2
            `, [providerData, user.email]);
            
            console.log(`   ⚠️  Updated user: ${user.email} (password reset)`);
          } else if (wasAdmin !== newIsAdmin || oldRole !== newRole) {
            console.log(`   ⚠️  Updated user: ${user.email} (${oldRole} → ${newRole}, admin: ${newIsAdmin})`);
          } else {
            console.log(`   ✅ Updated: ${user.email} (no changes)`);
          }
        } else {
          // Create new user
          const newUser = await client.query(`
            INSERT INTO "User" (
              id, "createdAt", "updatedAt", email, username, "organizationId",
              "isSuperAdmin", "isAdmin", role, "hasCompletedOnboarding", credits
            )
            VALUES (
              gen_random_uuid(), NOW(), NOW(), $1, $2, $3, false, $4, $5, true, 50000
            )
            RETURNING id
          `, [
            user.email,
            user.username || user.email.split('@')[0],
            orgId,
            user.isAdmin || false,
            user.role || 'USER'
          ]);
          userId = newUser.rows[0].id;
          
          // Create Auth
          const authResult = await client.query(`
            INSERT INTO "Auth" (id, "userId")
            VALUES (gen_random_uuid()::text, $1::text)
            RETURNING id
          `, [userId]);
          
          const authId = authResult.rows[0].id;

          // Hash password
          const hashedPassword = await hashPassword(user.password || 'TempPassword123!');

          // Create AuthIdentity
          const providerData = JSON.stringify({
            hashedPassword: hashedPassword,
            isEmailVerified: user.emailVerified !== false, // Default true
            emailVerificationSentAt: new Date().toISOString(),
            passwordResetSentAt: null,
          });

          await client.query(`
            INSERT INTO "AuthIdentity" ("providerName", "providerUserId", "providerData", "authId")
            VALUES ('email', $1, $2::text, $3::text)
          `, [user.email, providerData, authId]);

          const roleLabel = user.isAdmin ? 'Admin' : 'User';
          console.log(`   ✅ Created ${roleLabel}: ${user.email}`);
          stats.users++;
        }
      }
      console.log('');
    }

    // STEP 4: Create or Update Residents
    if (config.residents && config.residents.length > 0) {
      console.log('🏠 Step 4: Residents setup...');
      
      for (const resident of config.residents) {
        // Find property by code or use first property
        let propertyId = config._propertyIds[0];
        if (resident.propertyCode) {
          const propResult = await client.query(
            'SELECT id FROM "Property" WHERE code = $1 AND "organizationId" = $2',
            [resident.propertyCode, orgId]
          );
          if (propResult.rows.length > 0) {
            propertyId = propResult.rows[0].id;
          }
        }

        // Check if resident exists
        const existingResident = await client.query(
          'SELECT id FROM "Resident" WHERE "organizationId" = $1 AND "phoneNumber" = $2',
          [orgId, resident.phoneNumber]
        );

        if (existingResident.rows.length > 0) {
          // Update existing resident
          await client.query(`
            UPDATE "Resident" SET
              "firstName" = $1,
              "lastName" = $2,
              email = $3,
              "propertyId" = $4,
              "unitNumber" = $5,
              "monthlyRentAmount" = $6,
              "updatedAt" = NOW()
            WHERE id = $7
          `, [
            resident.firstName,
            resident.lastName,
            resident.email,
            propertyId,
            resident.unitNumber,
            resident.monthlyRentAmount || 2500,
            existingResident.rows[0].id
          ]);
          console.log(`   ✅ Updated: ${resident.firstName} ${resident.lastName} (Unit ${resident.unitNumber})`);
        } else {
          // Create new resident
          await client.query(`
            INSERT INTO "Resident" (
              id, "firstName", "lastName", email, "phoneNumber",
              "propertyId", "organizationId", "unitNumber",
              "moveInDate", "leaseStartDate", "leaseEndDate",
              "monthlyRentAmount", "rentDueDay", "leaseType", status,
              "createdAt", "updatedAt"
            )
            VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
              $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
            )
          `, [
            resident.firstName,
            resident.lastName,
            resident.email,
            resident.phoneNumber,
            propertyId,
            orgId,
            resident.unitNumber,
            resident.moveInDate ? new Date(resident.moveInDate) : new Date(),
            resident.leaseStartDate ? new Date(resident.leaseStartDate) : new Date(),
            resident.leaseEndDate ? new Date(resident.leaseEndDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            resident.monthlyRentAmount || 2500,
            resident.rentDueDay || 1,
            resident.leaseType || 'ONE_YEAR',
            resident.status || 'ACTIVE'
          ]);
          console.log(`   ✅ Created: ${resident.firstName} ${resident.lastName} (Unit ${resident.unitNumber})`);
          stats.residents++;
        }
      }
      console.log('');
    }

    // STEP 5: Create Maintenance Requests (optional)
    if (config.maintenanceRequests && config.maintenanceRequests.length > 0) {
      console.log('🔧 Step 5: Maintenance requests setup...');
      
      for (const ticket of config.maintenanceRequests) {
        // Find resident
        const residentResult = await client.query(
          'SELECT id FROM "Resident" WHERE "organizationId" = $1 AND "phoneNumber" = $2',
          [orgId, ticket.residentPhone]
        );

        if (residentResult.rows.length > 0) {
          const residentId = residentResult.rows[0].id;
          
          // Get property and unit number for this resident
          const propResult = await client.query(
            'SELECT "propertyId", "unitNumber" FROM "Resident" WHERE id = $1',
            [residentId]
          );
          const propertyId = propResult.rows[0].propertyId;
          const unitNumber = propResult.rows[0].unitNumber;

          await client.query(`
            INSERT INTO "MaintenanceRequest" (
              id, "createdAt", "updatedAt",
              title, description, status, priority, "requestType", "unitNumber",
              "residentId", "propertyId", "organizationId"
            )
            VALUES (
              gen_random_uuid(), NOW(), NOW(),
              $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
          `, [
            ticket.title,
            ticket.description || `Resident reported: ${ticket.title}`,
            ticket.status || 'SUBMITTED',
            ticket.priority || 'MEDIUM',
            ticket.requestType || ticket.category || 'GENERAL',
            unitNumber,
            residentId,
            propertyId,
            orgId
          ]);
          
          console.log(`   ✅ Created: ${ticket.title}`);
          stats.maintenanceTickets++;
        }
      }
      console.log('');
    }

    // Success Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ONBOARDING COMPLETE! 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 SUMMARY:');
    if (stats.organizations > 0) console.log(`   ✅ ${stats.organizations} Organization created`);
    if (stats.properties > 0) console.log(`   ✅ ${stats.properties} Properties created`);
    if (stats.users > 0) console.log(`   ✅ ${stats.users} Users created`);
    if (stats.residents > 0) console.log(`   ✅ ${stats.residents} Residents created`);
    if (stats.maintenanceTickets > 0) console.log(`   ✅ ${stats.maintenanceTickets} Maintenance Tickets created`);
    console.log('');

    console.log('⏱️  TOTAL TIME:', duration, 'seconds\n');

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Restart Fly.io app: fly apps restart my-invoice-po-crm-app-server');
    console.log('   2. Test login with created users\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error during onboarding:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

onboardFromJSON();
