# SSH into app
fly ssh console -a my-invoice-po-crm-app-server

# Get the DATABASE_URL
echo $DATABASE_URL

#SET TUNNEL
fly proxy 25432:5432 --app my-invoice-po-crm-app-db
IF THE ABOVE FAILS
flyctl wireguard list
flyctl wireguard remove
flyctl auth login
fly proxy 25432:5432 --app my-invoice-po-crm-app-db
postgres://my_invoice_po_crm_app_server:H7hAvW1IiNphKyl@my-invoice-po-crm-app-db.flycast:5432/my_invoice_po_crm_app_server?sslmode=disable
??THEN LOCALLY - export DATABASE_URL="postgresql://my_invoice_po_crm_app_server:H7hAvW1IiNphKyl@localhost:15432/my_invoice_po_crm_app_server"


# Connect to that database
psql $DATABASE_URL
psql "postgres://my_invoice_po_crm_app_server:H7hAvW1IiNphKyl@localhost:25432/my_invoice_po_crm_app_server"

You can also connect to the database with the following 2 commands - WITHOUT ANY PROXY SETTINGS
fly postgres connect -a my-invoice-po-crm-app-db
\c my_invoice_po_crm_app_server

```

# Check for the user you just created
SELECT email, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 5;

# Exit
\q
exit

#Proxy tunnel into server


## 🎯 **How Connection Strings Work**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
           │    │         │    │    │
           │    │         │    │    └─ Which database on the server
           │    │         │    └────── Port (5432 for Postgres)
           │    │         └─────────── Server address
           │    └───────────────────── Password for that user
           └────────────────────────── Username
Same tunnel, different databases:
bash# Via tunnel to Database 1 (postgres)
psql "postgresql://postgres:nZM7fNMAjLGMI8T@localhost:15432/postgres"


---

## 📊 **Visual Explanation**
```
YOU:
  │
  ├─ Run: fly proxy 15432:5432 -a my-invoice-po-crm-app-db
  │
  └─ Creates tunnel to POSTGRES SERVER
                │
                ▼
┌───────────────────────────────────────┐
│  Postgres Server (Port 5432)          │
│                                        │
│  Database #1: postgres                │ ← You connected here first
│    - Has different users              │
│    - Default database                 │
│                                        │
│  Database #2: my_invoice_po_crm_app_server  │ ← App connects here
│    - Has your signup users            │
│    - Your app's actual data           │
└───────────────────────────────────────┘
         ▲
         │
    Your App uses DATABASE_URL:
    postgresql://...@.../my_invoice_po_crm_app_server
