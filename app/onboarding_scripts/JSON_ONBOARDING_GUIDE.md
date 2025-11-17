# 🎯 JSON-Based Organization Onboarding

## ✅ What This Does

Complete organization setup through JSON configuration files:
- ✅ Create/update organizations
- ✅ Add/modify properties
- ✅ Add/modify users (with Argon2 passwords)
- ✅ Add/modify residents
- ✅ Add maintenance requests

**All driven by JSON - no code changes needed!**

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
npm install argon2 pg
```

### **2. Set Database URL**

```bash
export DATABASE_URL="postgresql://my_invoice_po_crm_app_server:H7hAvW1IiNphKyl@localhost:25432/my_invoice_po_crm_app_server"
```

### **3. Run with JSON Config**

```bash
# Complete organization setup
node onboard-json.cjs example-complete-org.json

# Or add specific things
node onboard-json.cjs example-add-property.json
node onboard-json.cjs example-add-users.json
node onboard-json.cjs example-add-residents.json
```

### **4. Restart App**

```bash
fly apps restart my-invoice-po-crm-app-server
```

---

## 📋 JSON Structure

### **Complete Example**

```json
{
  "mode": "create",
  "organization": {
    "name": "Company Name",
    "code": "COMPANYCODE",
    "businessEmail": "info@company.com",
    "businessPhone": "+1-555-0100",
    "timezone": "America/Los_Angeles"
  },
  "properties": [ ... ],
  "users": [ ... ],
  "residents": [ ... ],
  "maintenanceRequests": [ ... ]
}
```

### **Mode Field** ⚠️ **REQUIRED**

You MUST specify one of these modes:

- `"mode": "create"` - Forces creation of new org, errors if exists
- `"mode": "update"` - Updates if exists, creates if not

**See [MODE_GUIDE.md](computer:///mnt/user-data/outputs/MODE_GUIDE.md) for detailed scenarios**

---

## 🏢 Organization Section

**Required fields:**
- `name` - Organization name
- `code` - Unique code (auto-generated if not provided)

**Optional fields:**
- `businessEmail`
- `businessPhone`
- `timezone` (default: "America/Los_Angeles")

**Example:**
```json
{
  "organization": {
    "name": "Sunset Apartments LLC",
    "code": "SUNSET",
    "businessEmail": "info@sunsetapts.com",
    "businessPhone": "+1-555-0100"
  }
}
```

---

## 🏘️ Properties Section

**Required fields:**
- `name` - Property name

**Optional fields:**
- `code` - Property code (auto-generated if not provided)
- `address`
- `city`
- `state`
- `zipCode`

**Example:**
```json
{
  "properties": [
    {
      "code": "SUNSET01",
      "name": "Sunset Towers - Building A",
      "address": "123 Sunset Boulevard",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001"
    }
  ]
}
```

---

## 👥 Users Section

**Required fields:**
- `email` - User email (unique)

**Optional fields:**
- `username` - Defaults to email prefix
- `password` - Defaults to "TempPassword123!"
- `isAdmin` - Default: false
- `role` - "ADMIN" or "USER" (default: "USER")
- `emailVerified` - Default: true

**Example:**
```json
{
  "users": [
    {
      "email": "admin@sunsetapts.com",
      "username": "admin",
      "password": "AdminPass123!",
      "isAdmin": true,
      "role": "ADMIN",
      "emailVerified": true
    },
    {
      "email": "pm@sunsetapts.com",
      "password": "PMPass123!",
      "isAdmin": false,
      "role": "USER"
    }
  ]
}
```

**Important:** All passwords are hashed with Argon2 (same as Wasp)!

---

## 🏠 Residents Section

**Required fields:**
- `firstName`
- `lastName`
- `email`
- `phoneNumber` - Must be unique per organization
- `unitNumber`

**Optional fields:**
- `propertyCode` - Which property (uses first if not specified)
- `monthlyRentAmount` - Default: 2500
- `rentDueDay` - Default: 1
- `moveInDate` - Default: today
- `leaseStartDate` - Default: today
- `leaseEndDate` - Default: 1 year from today
- `leaseType` - Default: "ONE_YEAR"
- `status` - Default: "ACTIVE"

**Example:**
```json
{
  "residents": [
    {
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@email.com",
      "phoneNumber": "+1-213-555-1001",
      "propertyCode": "SUNSET01",
      "unitNumber": "101",
      "monthlyRentAmount": 2500,
      "moveInDate": "2024-01-15",
      "leaseStartDate": "2024-01-15",
      "leaseEndDate": "2025-01-14"
    }
  ]
}
```

---

## 🔧 Maintenance Requests Section

**Required fields:**
- `title`
- `residentPhone` - Links to resident

**Optional fields:**
- `description` - Auto-generated if not provided
- `priority` - "LOW", "MEDIUM", "HIGH" (default: "MEDIUM")
- `category` - "HVAC", "PLUMBING", "ELECTRICAL", "APPLIANCE", "GENERAL" (default: "GENERAL")
- `status` - "OPEN", "IN_PROGRESS", "COMPLETED" (default: "OPEN")

**Example:**
```json
{
  "maintenanceRequests": [
    {
      "title": "AC Not Working",
      "description": "Air conditioning not cooling properly",
      "residentPhone": "+1-213-555-1001",
      "priority": "HIGH",
      "category": "HVAC",
      "status": "OPEN"
    }
  ]
}
```

---

## 🎯 Use Cases

### **1. Create Complete New Organization**

```bash
node onboard-json.cjs example-complete-org.json
```

Creates everything at once:
- Organization
- 3 Properties
- 4 Users
- 5 Residents
- 4 Maintenance tickets

---

### **2. Add New Property to Existing Org**

**File: add-new-property.json**
```json
{
  "organization": {
    "name": "Sunset Apartments LLC",
    "code": "SUNSET"
  },
  "properties": [
    {
      "name": "Sunset Villa",
      "address": "300 Villa Lane",
      "city": "Los Angeles",
      "state": "CA"
    }
  ]
}
```

```bash
node onboard-json.cjs add-new-property.json
```

---

### **3. Add New Users**

**File: add-staff.json**
```json
{
  "organization": {
    "code": "SUNSET"
  },
  "users": [
    {
      "email": "accounting@sunsetapts.com",
      "password": "AcctPass123!",
      "role": "USER"
    }
  ]
}
```

```bash
node onboard-json.cjs add-staff.json
```

---

### **4. Add New Residents**

**File: new-residents.json**
```json
{
  "organization": {
    "code": "SUNSET"
  },
  "residents": [
    {
      "firstName": "Lisa",
      "lastName": "Garcia",
      "email": "lisa@email.com",
      "phoneNumber": "+1-213-555-2000",
      "propertyCode": "SUNSET01",
      "unitNumber": "301",
      "monthlyRentAmount": 3000
    }
  ]
}
```

```bash
node onboard-json.cjs new-residents.json
```

---

### **5. Update Existing Organization**

Just change values in JSON and run again - it will UPDATE instead of creating duplicates:

**File: update-org.json**
```json
{
  "organization": {
    "code": "SUNSET",
    "businessPhone": "+1-555-NEW-NUMBER"
  }
}
```

```bash
node onboard-json.cjs update-org.json
```

---

## 🔄 Update vs Create Logic

**The script intelligently handles updates:**

| Entity | Unique Key | Behavior |
|--------|-----------|----------|
| **Organization** | `code` | Updates if exists, creates if new |
| **Property** | `code` + `organizationId` | Updates if exists, creates if new |
| **User** | `email` | Updates if exists, creates if new |
| **Resident** | `organizationId` + `phoneNumber` | Updates if exists, creates if new |
| **Maintenance** | N/A | Always creates new |

---

## 📦 Example Files Provided

1. **[example-complete-org.json](computer:///mnt/user-data/outputs/example-complete-org.json)** - Full organization with everything
2. **[example-add-property.json](computer:///mnt/user-data/outputs/example-add-property.json)** - Add single property
3. **[example-add-users.json](computer:///mnt/user-data/outputs/example-add-users.json)** - Add users
4. **[example-add-residents.json](computer:///mnt/user-data/outputs/example-add-residents.json)** - Add residents

---

## ⚠️ Important Notes

1. **Organization code must exist** for updates to work
2. **Phone numbers must be unique** per organization for residents
3. **Emails must be globally unique** for users
4. **Property codes must be unique** per organization
5. **Passwords are hashed with Argon2** (not bcrypt!)
6. **Always restart app** after making changes

---

## 🎯 Complete Workflow

```bash
# 1. Create your JSON config
vi my-organization.json

# 2. Run onboarding
export DATABASE_URL="postgresql://..."
node onboard-json.cjs my-organization.json

# 3. Restart app
fly apps restart my-invoice-po-crm-app-server

# 4. Test login
# Use credentials from your JSON file
```

---

## 🐛 Troubleshooting

**"Organization not found"**
- Make sure `code` matches existing org

**"Duplicate key error"**
- Email/phone already exists
- Change to unique value

**"Property not found"**
- Make sure `propertyCode` is correct
- Check organization code is right

**Login fails**
- Passwords are case-sensitive
- Check Argon2 is installed: `npm list argon2`
- Restart app after creating users

---

## ✅ Best Practices

1. **Start small** - Test with one property/user first
2. **Keep backups** - Save your JSON configs
3. **Use consistent codes** - Makes updates easier
4. **Document passwords** - Store securely outside JSON
5. **Version your configs** - Track changes in git

---

**Now you can manage everything through JSON files!** 🚀
