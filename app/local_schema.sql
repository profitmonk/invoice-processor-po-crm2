--
-- PostgreSQL database dump
--

\restrict 7LLwEY0GNMFK5fIBLVorWJaJ5TVCqpifrAS1qYgH8NEeuFEvrH5EdysfGugc0qb

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgboss; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgboss;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: job_state; Type: TYPE; Schema: pgboss; Owner: -
--

CREATE TYPE pgboss.job_state AS ENUM (
    'created',
    'retry',
    'active',
    'completed',
    'expired',
    'cancelled',
    'failed'
);


--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SKIPPED'
);


--
-- Name: InvoiceEntryType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceEntryType" AS ENUM (
    'OCR',
    'MANUAL',
    'OCR_CORRECTED'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'UPLOADED',
    'PAYMENT_REQUIRED',
    'QUEUED',
    'PROCESSING_OCR',
    'PROCESSING_LLM',
    'COMPLETED',
    'FAILED'
);


--
-- Name: JobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."JobStatus" AS ENUM (
    'PENDING',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'RETRYING'
);


--
-- Name: LeadPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadPriority" AS ENUM (
    'HOT',
    'WARM',
    'COLD'
);


--
-- Name: LeadSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadSource" AS ENUM (
    'WEBSITE',
    'REFERRAL',
    'WALK_IN',
    'PHONE',
    'EMAIL',
    'SOCIAL_MEDIA',
    'ADVERTISING',
    'OTHER'
);


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'TOURING_SCHEDULED',
    'TOURED',
    'APPLIED',
    'APPROVED',
    'CONVERTED',
    'LOST'
);


--
-- Name: LeaseType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeaseType" AS ENUM (
    'MONTH_TO_MONTH',
    'SIX_MONTHS',
    'ONE_YEAR',
    'TWO_YEARS',
    'CUSTOM'
);


--
-- Name: MaintenancePriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaintenancePriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'EMERGENCY'
);


--
-- Name: MaintenanceRequestType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaintenanceRequestType" AS ENUM (
    'PLUMBING',
    'HVAC',
    'ELECTRICAL',
    'APPLIANCE',
    'GENERAL',
    'EMERGENCY',
    'PEST_CONTROL',
    'LANDSCAPING',
    'SECURITY',
    'OTHER'
);


--
-- Name: MaintenanceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MaintenanceStatus" AS ENUM (
    'SUBMITTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'COMPLETED',
    'CLOSED',
    'CANCELLED'
);


--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED'
);


--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MessageType" AS ENUM (
    'SMS',
    'PHONE_CALL',
    'EMAIL',
    'IN_APP'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'PO_APPROVAL_NEEDED',
    'PO_APPROVED',
    'PO_REJECTED',
    'PO_CANCELLED',
    'INVOICE_PO_MISMATCH',
    'USER_INVITED',
    'ROLE_CHANGED'
);


--
-- Name: POStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."POStatus" AS ENUM (
    'DRAFT',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'INVOICED'
);


--
-- Name: ResidentStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResidentStatus" AS ENUM (
    'ACTIVE',
    'NOTICE_GIVEN',
    'PAST_RESIDENT'
);


--
-- Name: SenderType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SenderType" AS ENUM (
    'RESIDENT',
    'LEAD',
    'AI_AGENT',
    'MANAGER',
    'SYSTEM'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'PROPERTY_MANAGER',
    'ACCOUNTING',
    'CORPORATE',
    'ADMIN',
    'SUPER_ADMIN'
);


--
-- Name: VapiCallStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VapiCallStatus" AS ENUM (
    'QUEUED',
    'RINGING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'BUSY',
    'NO_ANSWER',
    'CANCELLED'
);


--
-- Name: VapiCallType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VapiCallType" AS ENUM (
    'INBOUND',
    'OUTBOUND'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: archive; Type: TABLE; Schema: pgboss; Owner: -
--

CREATE TABLE pgboss.archive (
    id uuid NOT NULL,
    name text NOT NULL,
    priority integer NOT NULL,
    data jsonb,
    state pgboss.job_state NOT NULL,
    retrylimit integer NOT NULL,
    retrycount integer NOT NULL,
    retrydelay integer NOT NULL,
    retrybackoff boolean NOT NULL,
    startafter timestamp with time zone NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval NOT NULL,
    createdon timestamp with time zone NOT NULL,
    completedon timestamp with time zone,
    keepuntil timestamp with time zone NOT NULL,
    on_complete boolean NOT NULL,
    output jsonb,
    archivedon timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job; Type: TABLE; Schema: pgboss; Owner: -
--

CREATE TABLE pgboss.job (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    data jsonb,
    state pgboss.job_state DEFAULT 'created'::pgboss.job_state NOT NULL,
    retrylimit integer DEFAULT 0 NOT NULL,
    retrycount integer DEFAULT 0 NOT NULL,
    retrydelay integer DEFAULT 0 NOT NULL,
    retrybackoff boolean DEFAULT false NOT NULL,
    startafter timestamp with time zone DEFAULT now() NOT NULL,
    startedon timestamp with time zone,
    singletonkey text,
    singletonon timestamp without time zone,
    expirein interval DEFAULT '00:15:00'::interval NOT NULL,
    createdon timestamp with time zone DEFAULT now() NOT NULL,
    completedon timestamp with time zone,
    keepuntil timestamp with time zone DEFAULT (now() + '14 days'::interval) NOT NULL,
    on_complete boolean DEFAULT false NOT NULL,
    output jsonb
);


--
-- Name: schedule; Type: TABLE; Schema: pgboss; Owner: -
--

CREATE TABLE pgboss.schedule (
    name text NOT NULL,
    cron text NOT NULL,
    timezone text,
    data jsonb,
    options jsonb,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    updated_on timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subscription; Type: TABLE; Schema: pgboss; Owner: -
--

CREATE TABLE pgboss.subscription (
    event text NOT NULL,
    name text NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    updated_on timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: version; Type: TABLE; Schema: pgboss; Owner: -
--

CREATE TABLE pgboss.version (
    version integer NOT NULL,
    maintained_on timestamp with time zone,
    cron_on timestamp with time zone
);


--
-- Name: ApprovalAction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApprovalAction" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "purchaseOrderId" text NOT NULL,
    "stepNumber" integer NOT NULL,
    action text NOT NULL,
    comment text,
    "ipAddress" text,
    "userAgent" text
);


--
-- Name: ApprovalStep; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ApprovalStep" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "purchaseOrderId" text NOT NULL,
    "stepNumber" integer NOT NULL,
    "stepName" text NOT NULL,
    "requiredRole" public."UserRole" NOT NULL,
    status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    comment text,
    "notificationSentAt" timestamp(3) without time zone
);


--
-- Name: Auth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Auth" (
    id text NOT NULL,
    "userId" text
);


--
-- Name: AuthIdentity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuthIdentity" (
    "providerName" text NOT NULL,
    "providerUserId" text NOT NULL,
    "providerData" text DEFAULT '{}'::text NOT NULL,
    "authId" text NOT NULL
);


--
-- Name: ContactFormMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContactFormMessage" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "repliedAt" timestamp(3) without time zone
);


--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Conversation" (
    id text NOT NULL,
    "residentId" text,
    "leadId" text,
    "messageContent" text NOT NULL,
    "messageType" public."MessageType" DEFAULT 'SMS'::public."MessageType" NOT NULL,
    "senderType" public."SenderType" NOT NULL,
    "senderId" text,
    "aiGenerated" boolean DEFAULT false NOT NULL,
    "aiModel" text,
    "aiPromptTokens" integer,
    "aiResponseTokens" integer,
    status public."MessageStatus" DEFAULT 'SENT'::public."MessageStatus" NOT NULL,
    "twilioMessageSid" text,
    "twilioCallSid" text,
    "twilioStatus" text,
    "errorMessage" text,
    "organizationId" text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveredAt" timestamp(3) without time zone,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DailyStats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DailyStats" (
    id integer NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalViews" integer DEFAULT 0 NOT NULL,
    "prevDayViewsChangePercent" text DEFAULT '0'::text NOT NULL,
    "userCount" integer DEFAULT 0 NOT NULL,
    "paidUserCount" integer DEFAULT 0 NOT NULL,
    "userDelta" integer DEFAULT 0 NOT NULL,
    "paidUserDelta" integer DEFAULT 0 NOT NULL,
    "totalRevenue" double precision DEFAULT 0 NOT NULL,
    "totalProfit" double precision DEFAULT 0 NOT NULL
);


--
-- Name: DailyStats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."DailyStats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: DailyStats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."DailyStats_id_seq" OWNED BY public."DailyStats".id;


--
-- Name: ExpenseType; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExpenseType" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: File; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."File" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    key text NOT NULL,
    "uploadUrl" text NOT NULL
);


--
-- Name: GLAccount; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GLAccount" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL,
    "accountNumber" text NOT NULL,
    name text NOT NULL,
    "accountType" public."AccountType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "annualBudget" double precision
);


--
-- Name: GptResponse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GptResponse" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL
);


--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileSize" integer NOT NULL,
    "fileUrl" text NOT NULL,
    "mimeType" text NOT NULL,
    status public."InvoiceStatus" DEFAULT 'UPLOADED'::public."InvoiceStatus" NOT NULL,
    "entryType" public."InvoiceEntryType" DEFAULT 'MANUAL'::public."InvoiceEntryType" NOT NULL,
    "ocrText" text,
    "ocrConfidence" double precision,
    "ocrProcessedAt" timestamp(3) without time zone,
    "structuredData" jsonb,
    "llmProcessedAt" timestamp(3) without time zone,
    "vendorName" text,
    "invoiceNumber" text,
    "invoiceDate" timestamp(3) without time zone,
    "totalAmount" double precision,
    currency text DEFAULT 'USD'::text,
    "errorMessage" text,
    "failedAt" timestamp(3) without time zone
);


--
-- Name: InvoiceLineItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InvoiceLineItem" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "invoiceId" text NOT NULL,
    description text NOT NULL,
    quantity double precision,
    "unitPrice" double precision,
    amount double precision,
    "taxAmount" double precision,
    category text,
    "lineNumber" integer
);


--
-- Name: Lead; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    "phoneNumber" text NOT NULL,
    "leadSource" public."LeadSource" DEFAULT 'OTHER'::public."LeadSource" NOT NULL,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    priority public."LeadPriority" DEFAULT 'WARM'::public."LeadPriority" NOT NULL,
    "interestedPropertyId" text,
    "desiredBedrooms" integer,
    "budgetMin" double precision,
    "budgetMax" double precision,
    "desiredMoveInDate" timestamp(3) without time zone,
    "assignedManagerId" text,
    notes text,
    "organizationId" text NOT NULL,
    "convertedToResidentId" text,
    "convertedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdViaVapi" boolean DEFAULT false NOT NULL,
    "lastVapiCallAt" timestamp(3) without time zone
);


--
-- Name: Logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Logs" (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    message text NOT NULL,
    level text NOT NULL
);


--
-- Name: Logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Logs_id_seq" OWNED BY public."Logs".id;


--
-- Name: MaintenanceRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MaintenanceRequest" (
    id text NOT NULL,
    "residentId" text NOT NULL,
    "propertyId" text NOT NULL,
    "unitNumber" text NOT NULL,
    "requestType" public."MaintenanceRequestType" DEFAULT 'GENERAL'::public."MaintenanceRequestType" NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    priority public."MaintenancePriority" DEFAULT 'MEDIUM'::public."MaintenancePriority" NOT NULL,
    status public."MaintenanceStatus" DEFAULT 'SUBMITTED'::public."MaintenanceStatus" NOT NULL,
    "assignedToPhone" text,
    "assignedToName" text,
    "assignedManagerId" text,
    "resolutionNotes" text,
    "residentSatisfaction" integer,
    "residentFeedback" text,
    "photoUrls" text[] DEFAULT ARRAY[]::text[],
    "organizationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdViaVapi" boolean DEFAULT false NOT NULL,
    "vapiCallId" text
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    "actionUrl" text,
    "purchaseOrderId" text,
    "invoiceId" text,
    read boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "emailSent" boolean DEFAULT false NOT NULL,
    "emailSentAt" timestamp(3) without time zone,
    "smsSent" boolean DEFAULT false NOT NULL,
    "smsSentAt" timestamp(3) without time zone
);


--
-- Name: Organization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "poApprovalThreshold" double precision DEFAULT 500 NOT NULL,
    "aiAgentEnabled" boolean DEFAULT true NOT NULL,
    "campaignApprovedAt" timestamp(3) without time zone,
    "campaignDescription" text,
    "campaignRegisteredAt" timestamp(3) without time zone,
    "campaignRejectedAt" timestamp(3) without time zone,
    "campaignRejectionReason" text,
    "campaignStatus" text DEFAULT 'NOT_REGISTERED'::text,
    "campaignUseCase" text DEFAULT 'CUSTOMER_CARE'::text,
    "communicationSetup" boolean DEFAULT false NOT NULL,
    "dailySMSLimit" integer DEFAULT 2000,
    "dailySMSUsed" integer DEFAULT 0 NOT NULL,
    "lastSMSResetDate" timestamp(3) without time zone,
    "monthlySmsCost" double precision DEFAULT 0 NOT NULL,
    "setupCompletedAt" timestamp(3) without time zone,
    "smsCreditsLimit" integer,
    "smsCreditsUsed" integer DEFAULT 0 NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    timezone text DEFAULT 'America/Los_Angeles'::text,
    "twilioBrandSid" text,
    "twilioCampaignSid" text,
    "twilioMessagingServiceSid" text,
    "twilioPhoneNumber" text,
    "twilioPhoneNumberSid" text,
    "voiceEnabled" boolean DEFAULT false NOT NULL,
    "aiEnabled" boolean DEFAULT true NOT NULL,
    "businessEmail" text,
    "businessPhone" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "setupCompleted" boolean DEFAULT false NOT NULL,
    "vapiAccountId" text,
    "vapiEnabled" boolean DEFAULT false NOT NULL,
    "vapiWebhookSecret" text
);


--
-- Name: POLineItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."POLineItem" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "purchaseOrderId" text NOT NULL,
    "lineNumber" integer NOT NULL,
    description text NOT NULL,
    "propertyId" text NOT NULL,
    "glAccountId" text NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL,
    "unitPrice" double precision NOT NULL,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision NOT NULL
);


--
-- Name: PageViewSource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PageViewSource" (
    name text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dailyStatsId" integer,
    visitors integer NOT NULL
);


--
-- Name: PlatformConfig; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PlatformConfig" (
    id text NOT NULL,
    "twilioBrandSid" text,
    "twilioBrandStatus" text DEFAULT 'NOT_REGISTERED'::text,
    "twilioBrandRegisteredAt" timestamp(3) without time zone,
    "twilioBrandApprovedAt" timestamp(3) without time zone,
    "trustHubProfileSid" text,
    "a2pProfileBundleSid" text,
    "maxOrganizations" integer DEFAULT 100,
    "maxPhoneNumbers" integer DEFAULT 100,
    "campaignAutoApproval" boolean DEFAULT false NOT NULL,
    "allowSelfServiceOnboarding" boolean DEFAULT true NOT NULL,
    "lastHealthCheck" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProcessingJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProcessingJob" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invoiceId" text NOT NULL,
    status public."JobStatus" DEFAULT 'PENDING'::public."JobStatus" NOT NULL,
    "currentStep" text,
    attempts integer DEFAULT 0 NOT NULL,
    "maxAttempts" integer DEFAULT 3 NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone,
    "errorLog" text,
    "lastError" text
);


--
-- Name: Property; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    "isActive" boolean DEFAULT true NOT NULL,
    "afterHoursMessage" text,
    "aiGreeting" text DEFAULT 'Thank you for calling. How can I help you today?'::text,
    "aiInstructions" text,
    "aiKnowledgeBase" jsonb,
    "aiPersonality" text DEFAULT 'professional and helpful'::text,
    "businessHoursEnd" text DEFAULT '17:00'::text,
    "businessHoursStart" text DEFAULT '09:00'::text,
    city text,
    "emergencyPhone" text,
    "estimatedMonthlyCost" double precision DEFAULT 0,
    "lastCallAt" timestamp(3) without time zone,
    "lastResetAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "monthlyCallCount" integer DEFAULT 0 NOT NULL,
    "monthlyCallMinutes" integer DEFAULT 0 NOT NULL,
    "monthlySmsCount" integer DEFAULT 0 NOT NULL,
    state text,
    timezone text DEFAULT 'America/Los_Angeles'::text,
    "vapiActivatedAt" timestamp(3) without time zone,
    "vapiAssistantId" text,
    "vapiDeactivatedAt" timestamp(3) without time zone,
    "vapiEnabled" boolean DEFAULT false NOT NULL,
    "vapiPhoneNumber" text,
    "vapiPhoneNumberId" text,
    "vapiSetupCompleted" boolean DEFAULT false NOT NULL,
    "zipCode" text
);


--
-- Name: PurchaseOrder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PurchaseOrder" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL,
    "createdById" text NOT NULL,
    "poNumber" text NOT NULL,
    vendor text NOT NULL,
    description text NOT NULL,
    "expenseTypeId" text NOT NULL,
    "poDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."POStatus" DEFAULT 'DRAFT'::public."POStatus" NOT NULL,
    subtotal double precision DEFAULT 0 NOT NULL,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    "isTemplate" boolean DEFAULT false NOT NULL,
    "templateName" text,
    "requiresApproval" boolean DEFAULT false NOT NULL,
    "currentApprovalStep" integer,
    "linkedInvoiceId" text
);


--
-- Name: Resident; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Resident" (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    "phoneNumber" text NOT NULL,
    "propertyId" text NOT NULL,
    "unitNumber" text NOT NULL,
    "moveInDate" timestamp(3) without time zone NOT NULL,
    "monthlyRentAmount" double precision NOT NULL,
    "rentDueDay" integer DEFAULT 1 NOT NULL,
    "leaseStartDate" timestamp(3) without time zone NOT NULL,
    "leaseEndDate" timestamp(3) without time zone NOT NULL,
    "leaseType" public."LeaseType" DEFAULT 'ONE_YEAR'::public."LeaseType" NOT NULL,
    "emergencyContactName" text,
    "emergencyContactPhone" text,
    "emergencyContactRelationship" text,
    status public."ResidentStatus" DEFAULT 'ACTIVE'::public."ResidentStatus" NOT NULL,
    "organizationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- Name: Task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    description text NOT NULL,
    "time" text DEFAULT '1'::text NOT NULL,
    "isDone" boolean DEFAULT false NOT NULL
);


--
-- Name: TwilioPhoneNumber; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TwilioPhoneNumber" (
    id text NOT NULL,
    "phoneNumber" text NOT NULL,
    "phoneNumberSid" text NOT NULL,
    "organizationId" text,
    "messagingServiceSid" text,
    "campaignSid" text,
    status text DEFAULT 'AVAILABLE'::text NOT NULL,
    "smsEnabled" boolean DEFAULT true NOT NULL,
    "voiceEnabled" boolean DEFAULT true NOT NULL,
    "mmsEnabled" boolean DEFAULT false NOT NULL,
    "friendlyName" text,
    region text DEFAULT 'US'::text,
    "monthlyPrice" double precision DEFAULT 1.15 NOT NULL,
    "purchasedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "assignedAt" timestamp(3) without time zone,
    "releasedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text,
    username text,
    "organizationId" text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "hasCompletedOnboarding" boolean DEFAULT false NOT NULL,
    "invitedById" text,
    "invitationToken" text,
    "invitationExpiresAt" timestamp(3) without time zone,
    "phoneNumber" text,
    "paymentProcessorUserId" text,
    "lemonSqueezyCustomerPortalUrl" text,
    "subscriptionStatus" text,
    "subscriptionPlan" text,
    "datePaid" timestamp(3) without time zone,
    credits integer DEFAULT 3 NOT NULL,
    "isSuperAdmin" boolean DEFAULT false NOT NULL
);


--
-- Name: VapiCall; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VapiCall" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "vapiCallId" text NOT NULL,
    "propertyId" text NOT NULL,
    "organizationId" text NOT NULL,
    "callerPhone" text NOT NULL,
    "callerName" text,
    "residentId" text,
    "leadId" text,
    "callType" public."VapiCallType" DEFAULT 'INBOUND'::public."VapiCallType" NOT NULL,
    "callStatus" public."VapiCallStatus" DEFAULT 'IN_PROGRESS'::public."VapiCallStatus" NOT NULL,
    "callDirection" text NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "endedAt" timestamp(3) without time zone,
    "durationSeconds" integer,
    "assistantId" text NOT NULL,
    transcript text,
    summary text,
    sentiment text,
    "actionsTaken" jsonb,
    "recordingUrl" text,
    cost double precision,
    "vapiMetadata" jsonb,
    "maintenanceRequestId" text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: DailyStats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyStats" ALTER COLUMN id SET DEFAULT nextval('public."DailyStats_id_seq"'::regclass);


--
-- Name: Logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Logs" ALTER COLUMN id SET DEFAULT nextval('public."Logs_id_seq"'::regclass);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: -
--

ALTER TABLE ONLY pgboss.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: -
--

ALTER TABLE ONLY pgboss.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (name);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: -
--

ALTER TABLE ONLY pgboss.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (event, name);


--
-- Name: version version_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: -
--

ALTER TABLE ONLY pgboss.version
    ADD CONSTRAINT version_pkey PRIMARY KEY (version);


--
-- Name: ApprovalAction ApprovalAction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalAction"
    ADD CONSTRAINT "ApprovalAction_pkey" PRIMARY KEY (id);


--
-- Name: ApprovalStep ApprovalStep_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY (id);


--
-- Name: AuthIdentity AuthIdentity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuthIdentity"
    ADD CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("providerName", "providerUserId");


--
-- Name: Auth Auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Auth"
    ADD CONSTRAINT "Auth_pkey" PRIMARY KEY (id);


--
-- Name: ContactFormMessage ContactFormMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactFormMessage"
    ADD CONSTRAINT "ContactFormMessage_pkey" PRIMARY KEY (id);


--
-- Name: Conversation Conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_pkey" PRIMARY KEY (id);


--
-- Name: DailyStats DailyStats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DailyStats"
    ADD CONSTRAINT "DailyStats_pkey" PRIMARY KEY (id);


--
-- Name: ExpenseType ExpenseType_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExpenseType"
    ADD CONSTRAINT "ExpenseType_pkey" PRIMARY KEY (id);


--
-- Name: File File_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."File"
    ADD CONSTRAINT "File_pkey" PRIMARY KEY (id);


--
-- Name: GLAccount GLAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GLAccount"
    ADD CONSTRAINT "GLAccount_pkey" PRIMARY KEY (id);


--
-- Name: GptResponse GptResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GptResponse"
    ADD CONSTRAINT "GptResponse_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceLineItem InvoiceLineItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceLineItem"
    ADD CONSTRAINT "InvoiceLineItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Logs Logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Logs"
    ADD CONSTRAINT "Logs_pkey" PRIMARY KEY (id);


--
-- Name: MaintenanceRequest MaintenanceRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- Name: POLineItem POLineItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."POLineItem"
    ADD CONSTRAINT "POLineItem_pkey" PRIMARY KEY (id);


--
-- Name: PageViewSource PageViewSource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PageViewSource"
    ADD CONSTRAINT "PageViewSource_pkey" PRIMARY KEY (date, name);


--
-- Name: PlatformConfig PlatformConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PlatformConfig"
    ADD CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY (id);


--
-- Name: ProcessingJob ProcessingJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProcessingJob"
    ADD CONSTRAINT "ProcessingJob_pkey" PRIMARY KEY (id);


--
-- Name: Property Property_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_pkey" PRIMARY KEY (id);


--
-- Name: PurchaseOrder PurchaseOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY (id);


--
-- Name: Resident Resident_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resident"
    ADD CONSTRAINT "Resident_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: TwilioPhoneNumber TwilioPhoneNumber_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TwilioPhoneNumber"
    ADD CONSTRAINT "TwilioPhoneNumber_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VapiCall VapiCall_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VapiCall"
    ADD CONSTRAINT "VapiCall_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: archive_archivedon_idx; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE INDEX archive_archivedon_idx ON pgboss.archive USING btree (archivedon);


--
-- Name: archive_id_idx; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE INDEX archive_id_idx ON pgboss.archive USING btree (id);


--
-- Name: job_fetch; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE INDEX job_fetch ON pgboss.job USING btree (name text_pattern_ops, startafter) WHERE (state < 'active'::pgboss.job_state);


--
-- Name: job_name; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE INDEX job_name ON pgboss.job USING btree (name text_pattern_ops);


--
-- Name: job_singleton_queue; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE UNIQUE INDEX job_singleton_queue ON pgboss.job USING btree (name, singletonkey) WHERE ((state < 'active'::pgboss.job_state) AND (singletonon IS NULL) AND (singletonkey ~~ '\_\_pgboss\_\_singleton\_queue%'::text));


--
-- Name: job_singletonkey; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE UNIQUE INDEX job_singletonkey ON pgboss.job USING btree (name, singletonkey) WHERE ((state < 'completed'::pgboss.job_state) AND (singletonon IS NULL) AND (NOT (singletonkey ~~ '\_\_pgboss\_\_singleton\_queue%'::text)));


--
-- Name: job_singletonkeyon; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE UNIQUE INDEX job_singletonkeyon ON pgboss.job USING btree (name, singletonon, singletonkey) WHERE (state < 'expired'::pgboss.job_state);


--
-- Name: job_singletonon; Type: INDEX; Schema: pgboss; Owner: -
--

CREATE UNIQUE INDEX job_singletonon ON pgboss.job USING btree (name, singletonon) WHERE ((state < 'expired'::pgboss.job_state) AND (singletonkey IS NULL));


--
-- Name: ApprovalAction_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalAction_createdAt_idx" ON public."ApprovalAction" USING btree ("createdAt");


--
-- Name: ApprovalAction_purchaseOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalAction_purchaseOrderId_idx" ON public."ApprovalAction" USING btree ("purchaseOrderId");


--
-- Name: ApprovalAction_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalAction_userId_idx" ON public."ApprovalAction" USING btree ("userId");


--
-- Name: ApprovalStep_purchaseOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalStep_purchaseOrderId_idx" ON public."ApprovalStep" USING btree ("purchaseOrderId");


--
-- Name: ApprovalStep_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalStep_status_idx" ON public."ApprovalStep" USING btree (status);


--
-- Name: ApprovalStep_stepNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ApprovalStep_stepNumber_idx" ON public."ApprovalStep" USING btree ("stepNumber");


--
-- Name: Auth_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Auth_userId_key" ON public."Auth" USING btree ("userId");


--
-- Name: Conversation_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_createdAt_idx" ON public."Conversation" USING btree ("createdAt");


--
-- Name: Conversation_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_leadId_idx" ON public."Conversation" USING btree ("leadId");


--
-- Name: Conversation_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_organizationId_idx" ON public."Conversation" USING btree ("organizationId");


--
-- Name: Conversation_residentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Conversation_residentId_idx" ON public."Conversation" USING btree ("residentId");


--
-- Name: Conversation_twilioCallSid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_twilioCallSid_key" ON public."Conversation" USING btree ("twilioCallSid");


--
-- Name: Conversation_twilioMessageSid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Conversation_twilioMessageSid_key" ON public."Conversation" USING btree ("twilioMessageSid");


--
-- Name: DailyStats_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DailyStats_date_key" ON public."DailyStats" USING btree (date);


--
-- Name: ExpenseType_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExpenseType_isActive_idx" ON public."ExpenseType" USING btree ("isActive");


--
-- Name: ExpenseType_organizationId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ExpenseType_organizationId_code_key" ON public."ExpenseType" USING btree ("organizationId", code);


--
-- Name: ExpenseType_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ExpenseType_organizationId_idx" ON public."ExpenseType" USING btree ("organizationId");


--
-- Name: GLAccount_accountType_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GLAccount_accountType_idx" ON public."GLAccount" USING btree ("accountType");


--
-- Name: GLAccount_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GLAccount_isActive_idx" ON public."GLAccount" USING btree ("isActive");


--
-- Name: GLAccount_organizationId_accountNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "GLAccount_organizationId_accountNumber_key" ON public."GLAccount" USING btree ("organizationId", "accountNumber");


--
-- Name: GLAccount_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "GLAccount_organizationId_idx" ON public."GLAccount" USING btree ("organizationId");


--
-- Name: InvoiceLineItem_invoiceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "InvoiceLineItem_invoiceId_idx" ON public."InvoiceLineItem" USING btree ("invoiceId");


--
-- Name: Invoice_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_createdAt_idx" ON public."Invoice" USING btree ("createdAt");


--
-- Name: Invoice_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_status_idx" ON public."Invoice" USING btree (status);


--
-- Name: Invoice_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Invoice_userId_idx" ON public."Invoice" USING btree ("userId");


--
-- Name: Lead_assignedManagerId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_assignedManagerId_idx" ON public."Lead" USING btree ("assignedManagerId");


--
-- Name: Lead_convertedToResidentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Lead_convertedToResidentId_key" ON public."Lead" USING btree ("convertedToResidentId");


--
-- Name: Lead_interestedPropertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_interestedPropertyId_idx" ON public."Lead" USING btree ("interestedPropertyId");


--
-- Name: Lead_organizationId_phoneNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Lead_organizationId_phoneNumber_key" ON public."Lead" USING btree ("organizationId", "phoneNumber");


--
-- Name: Lead_organizationId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Lead_organizationId_status_idx" ON public."Lead" USING btree ("organizationId", status);


--
-- Name: MaintenanceRequest_organizationId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_organizationId_status_idx" ON public."MaintenanceRequest" USING btree ("organizationId", status);


--
-- Name: MaintenanceRequest_priority_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_priority_idx" ON public."MaintenanceRequest" USING btree (priority);


--
-- Name: MaintenanceRequest_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_propertyId_idx" ON public."MaintenanceRequest" USING btree ("propertyId");


--
-- Name: MaintenanceRequest_residentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_residentId_idx" ON public."MaintenanceRequest" USING btree ("residentId");


--
-- Name: MaintenanceRequest_vapiCallId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MaintenanceRequest_vapiCallId_idx" ON public."MaintenanceRequest" USING btree ("vapiCallId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_read_idx" ON public."Notification" USING btree (read);


--
-- Name: Notification_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_type_idx" ON public."Notification" USING btree (type);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: Organization_campaignStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_campaignStatus_idx" ON public."Organization" USING btree ("campaignStatus");


--
-- Name: Organization_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_code_idx" ON public."Organization" USING btree (code);


--
-- Name: Organization_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Organization_code_key" ON public."Organization" USING btree (code);


--
-- Name: Organization_communicationSetup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_communicationSetup_idx" ON public."Organization" USING btree ("communicationSetup");


--
-- Name: Organization_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_isActive_idx" ON public."Organization" USING btree ("isActive");


--
-- Name: Organization_twilioCampaignSid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_twilioCampaignSid_idx" ON public."Organization" USING btree ("twilioCampaignSid");


--
-- Name: Organization_twilioCampaignSid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Organization_twilioCampaignSid_key" ON public."Organization" USING btree ("twilioCampaignSid");


--
-- Name: Organization_twilioPhoneNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_twilioPhoneNumber_idx" ON public."Organization" USING btree ("twilioPhoneNumber");


--
-- Name: Organization_twilioPhoneNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Organization_twilioPhoneNumber_key" ON public."Organization" USING btree ("twilioPhoneNumber");


--
-- Name: Organization_vapiEnabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Organization_vapiEnabled_idx" ON public."Organization" USING btree ("vapiEnabled");


--
-- Name: POLineItem_glAccountId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "POLineItem_glAccountId_idx" ON public."POLineItem" USING btree ("glAccountId");


--
-- Name: POLineItem_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "POLineItem_propertyId_idx" ON public."POLineItem" USING btree ("propertyId");


--
-- Name: POLineItem_purchaseOrderId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "POLineItem_purchaseOrderId_idx" ON public."POLineItem" USING btree ("purchaseOrderId");


--
-- Name: PlatformConfig_twilioBrandSid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PlatformConfig_twilioBrandSid_key" ON public."PlatformConfig" USING btree ("twilioBrandSid");


--
-- Name: ProcessingJob_invoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProcessingJob_invoiceId_key" ON public."ProcessingJob" USING btree ("invoiceId");


--
-- Name: ProcessingJob_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProcessingJob_status_idx" ON public."ProcessingJob" USING btree (status);


--
-- Name: Property_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_isActive_idx" ON public."Property" USING btree ("isActive");


--
-- Name: Property_organizationId_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Property_organizationId_code_key" ON public."Property" USING btree ("organizationId", code);


--
-- Name: Property_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_organizationId_idx" ON public."Property" USING btree ("organizationId");


--
-- Name: Property_vapiAssistantId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_vapiAssistantId_idx" ON public."Property" USING btree ("vapiAssistantId");


--
-- Name: Property_vapiAssistantId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Property_vapiAssistantId_key" ON public."Property" USING btree ("vapiAssistantId");


--
-- Name: Property_vapiEnabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_vapiEnabled_idx" ON public."Property" USING btree ("vapiEnabled");


--
-- Name: Property_vapiPhoneNumber_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Property_vapiPhoneNumber_idx" ON public."Property" USING btree ("vapiPhoneNumber");


--
-- Name: Property_vapiPhoneNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Property_vapiPhoneNumber_key" ON public."Property" USING btree ("vapiPhoneNumber");


--
-- Name: PurchaseOrder_createdById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PurchaseOrder_createdById_idx" ON public."PurchaseOrder" USING btree ("createdById");


--
-- Name: PurchaseOrder_linkedInvoiceId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PurchaseOrder_linkedInvoiceId_key" ON public."PurchaseOrder" USING btree ("linkedInvoiceId");


--
-- Name: PurchaseOrder_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PurchaseOrder_organizationId_idx" ON public."PurchaseOrder" USING btree ("organizationId");


--
-- Name: PurchaseOrder_organizationId_poNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PurchaseOrder_organizationId_poNumber_key" ON public."PurchaseOrder" USING btree ("organizationId", "poNumber");


--
-- Name: PurchaseOrder_requiresApproval_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PurchaseOrder_requiresApproval_idx" ON public."PurchaseOrder" USING btree ("requiresApproval");


--
-- Name: PurchaseOrder_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PurchaseOrder_status_idx" ON public."PurchaseOrder" USING btree (status);


--
-- Name: Resident_organizationId_phoneNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Resident_organizationId_phoneNumber_key" ON public."Resident" USING btree ("organizationId", "phoneNumber");


--
-- Name: Resident_organizationId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Resident_organizationId_status_idx" ON public."Resident" USING btree ("organizationId", status);


--
-- Name: Resident_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Resident_propertyId_idx" ON public."Resident" USING btree ("propertyId");


--
-- Name: Session_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_id_key" ON public."Session" USING btree (id);


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: TwilioPhoneNumber_campaignSid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TwilioPhoneNumber_campaignSid_idx" ON public."TwilioPhoneNumber" USING btree ("campaignSid");


--
-- Name: TwilioPhoneNumber_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TwilioPhoneNumber_organizationId_idx" ON public."TwilioPhoneNumber" USING btree ("organizationId");


--
-- Name: TwilioPhoneNumber_organizationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TwilioPhoneNumber_organizationId_key" ON public."TwilioPhoneNumber" USING btree ("organizationId");


--
-- Name: TwilioPhoneNumber_phoneNumberSid_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TwilioPhoneNumber_phoneNumberSid_key" ON public."TwilioPhoneNumber" USING btree ("phoneNumberSid");


--
-- Name: TwilioPhoneNumber_phoneNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TwilioPhoneNumber_phoneNumber_key" ON public."TwilioPhoneNumber" USING btree ("phoneNumber");


--
-- Name: TwilioPhoneNumber_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TwilioPhoneNumber_status_idx" ON public."TwilioPhoneNumber" USING btree (status);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_invitationToken_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_invitationToken_idx" ON public."User" USING btree ("invitationToken");


--
-- Name: User_invitationToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_invitationToken_key" ON public."User" USING btree ("invitationToken");


--
-- Name: User_isSuperAdmin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_isSuperAdmin_idx" ON public."User" USING btree ("isSuperAdmin");


--
-- Name: User_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_organizationId_idx" ON public."User" USING btree ("organizationId");


--
-- Name: User_paymentProcessorUserId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_paymentProcessorUserId_key" ON public."User" USING btree ("paymentProcessorUserId");


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: VapiCall_callStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_callStatus_idx" ON public."VapiCall" USING btree ("callStatus");


--
-- Name: VapiCall_callerPhone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_callerPhone_idx" ON public."VapiCall" USING btree ("callerPhone");


--
-- Name: VapiCall_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_createdAt_idx" ON public."VapiCall" USING btree ("createdAt");


--
-- Name: VapiCall_leadId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_leadId_idx" ON public."VapiCall" USING btree ("leadId");


--
-- Name: VapiCall_maintenanceRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VapiCall_maintenanceRequestId_key" ON public."VapiCall" USING btree ("maintenanceRequestId");


--
-- Name: VapiCall_organizationId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_organizationId_idx" ON public."VapiCall" USING btree ("organizationId");


--
-- Name: VapiCall_propertyId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_propertyId_idx" ON public."VapiCall" USING btree ("propertyId");


--
-- Name: VapiCall_residentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VapiCall_residentId_idx" ON public."VapiCall" USING btree ("residentId");


--
-- Name: VapiCall_vapiCallId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VapiCall_vapiCallId_key" ON public."VapiCall" USING btree ("vapiCallId");


--
-- Name: ApprovalAction ApprovalAction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalAction"
    ADD CONSTRAINT "ApprovalAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ApprovalStep ApprovalStep_approvedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ApprovalStep ApprovalStep_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ApprovalStep"
    ADD CONSTRAINT "ApprovalStep_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public."PurchaseOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AuthIdentity AuthIdentity_authId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuthIdentity"
    ADD CONSTRAINT "AuthIdentity_authId_fkey" FOREIGN KEY ("authId") REFERENCES public."Auth"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Auth Auth_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Auth"
    ADD CONSTRAINT "Auth_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ContactFormMessage ContactFormMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContactFormMessage"
    ADD CONSTRAINT "ContactFormMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Conversation Conversation_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Conversation Conversation_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Conversation"
    ADD CONSTRAINT "Conversation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExpenseType ExpenseType_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExpenseType"
    ADD CONSTRAINT "ExpenseType_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: File File_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."File"
    ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GLAccount GLAccount_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GLAccount"
    ADD CONSTRAINT "GLAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: GptResponse GptResponse_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GptResponse"
    ADD CONSTRAINT "GptResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InvoiceLineItem InvoiceLineItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InvoiceLineItem"
    ADD CONSTRAINT "InvoiceLineItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lead Lead_assignedManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_assignedManagerId_fkey" FOREIGN KEY ("assignedManagerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_interestedPropertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_interestedPropertyId_fkey" FOREIGN KEY ("interestedPropertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Lead Lead_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MaintenanceRequest MaintenanceRequest_assignedManagerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_assignedManagerId_fkey" FOREIGN KEY ("assignedManagerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MaintenanceRequest MaintenanceRequest_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MaintenanceRequest MaintenanceRequest_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MaintenanceRequest MaintenanceRequest_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MaintenanceRequest"
    ADD CONSTRAINT "MaintenanceRequest_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: POLineItem POLineItem_glAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."POLineItem"
    ADD CONSTRAINT "POLineItem_glAccountId_fkey" FOREIGN KEY ("glAccountId") REFERENCES public."GLAccount"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: POLineItem POLineItem_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."POLineItem"
    ADD CONSTRAINT "POLineItem_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: POLineItem POLineItem_purchaseOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."POLineItem"
    ADD CONSTRAINT "POLineItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES public."PurchaseOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PageViewSource PageViewSource_dailyStatsId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PageViewSource"
    ADD CONSTRAINT "PageViewSource_dailyStatsId_fkey" FOREIGN KEY ("dailyStatsId") REFERENCES public."DailyStats"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProcessingJob ProcessingJob_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProcessingJob"
    ADD CONSTRAINT "ProcessingJob_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Property Property_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Property"
    ADD CONSTRAINT "Property_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PurchaseOrder PurchaseOrder_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PurchaseOrder PurchaseOrder_expenseTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_expenseTypeId_fkey" FOREIGN KEY ("expenseTypeId") REFERENCES public."ExpenseType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PurchaseOrder PurchaseOrder_linkedInvoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_linkedInvoiceId_fkey" FOREIGN KEY ("linkedInvoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PurchaseOrder PurchaseOrder_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PurchaseOrder"
    ADD CONSTRAINT "PurchaseOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Resident Resident_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resident"
    ADD CONSTRAINT "Resident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Resident Resident_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resident"
    ADD CONSTRAINT "Resident_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Auth"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_invitedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: VapiCall VapiCall_leadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VapiCall"
    ADD CONSTRAINT "VapiCall_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES public."Lead"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VapiCall VapiCall_maintenanceRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VapiCall"
    ADD CONSTRAINT "VapiCall_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES public."MaintenanceRequest"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: VapiCall VapiCall_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VapiCall"
    ADD CONSTRAINT "VapiCall_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public."Organization"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VapiCall VapiCall_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VapiCall"
    ADD CONSTRAINT "VapiCall_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: VapiCall VapiCall_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VapiCall"
    ADD CONSTRAINT "VapiCall_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public."Resident"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 7LLwEY0GNMFK5fIBLVorWJaJ5TVCqpifrAS1qYgH8NEeuFEvrH5EdysfGugc0qb

