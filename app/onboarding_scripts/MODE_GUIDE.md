# 🎯 CREATE vs UPDATE Mode Guide

## 📋 Overview

The script **requires** you to specify a mode for handling organizations:

| Mode | When to Use | Behavior |
|------|-------------|----------|
| **`update`** | Adding to existing org | Updates if exists, creates if not |
| **`create`** | Creating brand new org | Forces creation, errors if exists |

⚠️ **Mode is MANDATORY** - Script will error if not provided

---

## 🔧 Mode Selection

Add `"mode"` at the top level of your JSON (REQUIRED):

```json
{
  "mode": "update",  // or "create" - REQUIRED!
  "organization": { ... }
}
```

**Missing mode?** Script will exit with error and show examples.

---

## 📖 Scenario 1: Update Existing Organization

**Use case:** Add properties, users, residents to existing org

**JSON:**
```json
{
  "mode": "update",
  "organization": {
    "name": "Sunset Apartments LLC",
    "code": "SUNSET"
  },
  "properties": [
    {
      "name": "New Building D",
      "address": "400 Sunset Blvd"
    }
  ],
  "users": [
    {
      "email": "newstaff@sunsetapts.com",
      "password": "Pass123!"
    }
  ]
}
```

**What happens:**
1. ✅ Finds existing "Sunset Apartments LLC" (by name or code)
2. ✅ Updates organization info
3. ✅ Adds new property to existing org
4. ✅ Adds new user to existing org

**Output:**
```
ℹ️  Mode: UPDATE (will update if exists, create if not)

🏢 Step 1: Organization setup...
   ✅ Updated existing: Sunset Apartments LLC (SUNSET)

🏘️  Step 2: Properties setup...
   ✅ Created: New Building D

👥 Step 3: Users setup...
   ✅ Created User: newstaff@sunsetapts.com
```

---

## 📖 Scenario 2: Create New Organization

**Use case:** Creating a completely new organization that might have similar name

**JSON:**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunset Apartments - Miami",
    "code": "SUNSET_MIA",
    "businessEmail": "info@sunset-miami.com"
  },
  "properties": [
    {
      "name": "Miami Beach Tower",
      "code": "MIA01"
    }
  ],
  "users": [
    {
      "email": "admin@sunset-miami.com",
      "password": "MiamiPass123!",
      "isAdmin": true
    }
  ]
}
```

**What happens:**
1. ✅ Checks if "Sunset Apartments - Miami" or "SUNSET_MIA" exists
2. ✅ If NOT exists → Creates new org
3. ✅ Adds properties and users to NEW org

**Output:**
```
⚠️  Mode: CREATE (will fail if org exists)

🏢 Step 1: Organization setup...
   ✅ Created new: Sunset Apartments - Miami (SUNSET_MIA)

🏘️  Step 2: Properties setup...
   ✅ Created: Miami Beach Tower

👥 Step 3: Users setup...
   ✅ Created Admin: admin@sunset-miami.com
```

---

## ❌ Scenario 3: CREATE Mode - Conflict Detected

**What if org already exists when using `"mode": "create"`?**

**JSON:**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunset Apartments LLC",  // Already exists!
    "code": "SUNSET"                  // Already exists!
  }
}
```

**Output:**
```
⚠️  Mode: CREATE (will fail if org exists)

🏢 Step 1: Organization setup...

❌ ERROR: Organization already exists!
   Existing: "Sunset Apartments LLC" (code: SUNSET)
   Your config: "Sunset Apartments LLC" (code: SUNSET)

🔧 To fix this:
   1. If you want to UPDATE existing org:
      Remove "mode": "create" from JSON (or set to "update")

   2. If you want to CREATE a NEW org:
      Change BOTH name AND code to be unique:
      "name": "Sunset Apartments - Location 2"
      "code": "SUNSET2"
```

**Script exits with error** - Forces you to make explicit choice!

---

## 🎯 Decision Tree

```
Do you want to add to existing org?
├─ YES → Use "mode": "update" (or omit mode)
│         - Adds properties/users/residents
│         - Safe to run multiple times
│
└─ NO → Use "mode": "create"
          - Creates brand new org
          - Errors if name/code exists
          - Forces unique identifiers
```

---

## 📊 Examples

### **Example 1: Weekly Updates**

You add new residents weekly to existing org:

**File: weekly-residents.json**
```json
{
  "mode": "update",
  "organization": {"code": "SUNSET"},
  "residents": [
    {
      "firstName": "New",
      "lastName": "Resident",
      "phoneNumber": "+1-555-XXXX",
      "unitNumber": "405"
    }
  ]
}
```

Run every week:
```bash
node onboard-json.cjs weekly-residents.json
```

✅ Safe to run repeatedly - adds new residents each time

---

### **Example 2: Expanding to New Location**

You're opening "Sunset Apartments" in a new city:

**File: miami-location.json**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunset Apartments - Miami Beach",
    "code": "SUNSET_MIAMI",
    "businessEmail": "miami@sunsetapts.com"
  },
  "properties": [
    {
      "name": "Beachfront Tower",
      "city": "Miami Beach",
      "state": "FL"
    }
  ]
}
```

✅ Creates completely separate organization  
✅ Won't accidentally update your LA location

---

### **Example 3: Franchise System**

Managing multiple "Sunset Apartments" franchises:

**Los Angeles:**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunset Apartments - Los Angeles",
    "code": "SUNSET_LA"
  }
}
```

**Miami:**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunset Apartments - Miami",
    "code": "SUNSET_MIA"
  }
}
```

**Chicago:**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunset Apartments - Chicago",
    "code": "SUNSET_CHI"
  }
}
```

✅ Each is separate organization  
✅ No cross-contamination  
✅ Mode "create" ensures no mistakes

---

## 🔄 Mode for Each Operation

**Every JSON file MUST have mode:**

**First time (create):**
```json
{
  "mode": "create",
  "organization": {
    "name": "Sunrise Properties",
    "code": "SUNRISE"
  }
}
```

**Later updates:**
```json
{
  "mode": "update",
  "organization": {
    "code": "SUNRISE"
  },
  "properties": [ ... ]
}
```

⚠️ **No default** - You must explicitly choose!

---

## ⚠️ Best Practices

### **✅ DO:**

1. **Always specify mode explicitly**
   - Script requires it
   - Makes intent clear

2. **Use `"mode": "create"` for new organizations**
   - Prevents accidental updates
   - Forces unique naming

3. **Use `"mode": "update"` for modifications**
   - Safe for incremental changes
   - Standard for ongoing operations

4. **Use unique codes for different locations**
   - SUNSET_LA, SUNSET_MIA, SUNSET_CHI
   - Makes it crystal clear

5. **Include location in name for franchises**
   - "Sunset Apartments - Miami"
   - "Sunset Apartments - Chicago"

### **❌ DON'T:**

1. **Don't omit mode**
   - Script will error
   - No default value

2. **Don't use `"mode": "create"` for updates**
   - Will error if org exists
   - Use "update" instead

3. **Don't reuse codes across orgs**
   - Each org needs unique code
   - Even if names are different

---

## 🐛 Troubleshooting

**Error: "Organization already exists"**

**Cause:** Using `"mode": "create"` but org exists

**Fix:**
- Change to `"mode": "update"` if you want to modify existing
- Change name AND code if you want new org

---

**Properties/users going to wrong org**

**Cause:** Multiple orgs with similar names, wrong one selected

**Fix:**
- Always use unique `code` in JSON
- Use `"mode": "create"` when creating new orgs
- Check script output to see which org was selected

---

**Accidentally updated wrong org**

**Cause:** Name matched unexpected org

**Fix:**
- Always specify exact `code` in JSON
- Use `"mode": "create"` to prevent this
- Check database before running script

---

## 📊 Summary

| Scenario | Mode | Result |
|----------|------|--------|
| Add properties to existing org | `"mode": "update"` | ✅ Updates org, adds properties |
| Add users to existing org | `"mode": "update"` | ✅ Updates org, adds users |
| Create brand new org | `"mode": "create"` | ✅ Creates if unique, errors if exists |
| Franchise/multi-location | `"mode": "create"` | ✅ Forces unique identifiers |
| Weekly resident updates | `"mode": "update"` | ✅ Safe to repeat |
| First time setup | `"mode": "create"` | ✅ Ensures clean start |
| Missing mode | ❌ ERROR | Script exits with helpful message |

---

**Mode is mandatory - choose explicitly every time!** 🎯
