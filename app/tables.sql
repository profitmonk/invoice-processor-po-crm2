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


ALTER TABLE pgboss.archive OWNER TO postgres;

--
-- Name: job; Type: TABLE; Schema: pgboss; Owner: postgres
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


ALTER TABLE pgboss.job OWNER TO postgres;

--
-- Name: schedule; Type: TABLE; Schema: pgboss; Owner: postgres
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


ALTER TABLE pgboss.schedule OWNER TO postgres;

--
-- Name: subscription; Type: TABLE; Schema: pgboss; Owner: postgres
--

CREATE TABLE pgboss.subscription (
    event text NOT NULL,
    name text NOT NULL,
    created_on timestamp with time zone DEFAULT now() NOT NULL,
    updated_on timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE pgboss.subscription OWNER TO postgres;

--
-- Name: version; Type: TABLE; Schema: pgboss; Owner: postgres
--

CREATE TABLE pgboss.version (
    version integer NOT NULL,
    maintained_on timestamp with time zone,
    cron_on timestamp with time zone
);


ALTER TABLE pgboss.version OWNER TO postgres;

--
-- Name: ApprovalAction; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."ApprovalAction" OWNER TO postgres;

--
-- Name: ApprovalStep; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."ApprovalStep" OWNER TO postgres;

--
-- Name: Auth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Auth" (
    id text NOT NULL,
    "userId" text
);


ALTER TABLE public."Auth" OWNER TO postgres;

--
-- Name: AuthIdentity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuthIdentity" (
    "providerName" text NOT NULL,
    "providerUserId" text NOT NULL,
    "providerData" text DEFAULT '{}'::text NOT NULL,
    "authId" text NOT NULL
);


ALTER TABLE public."AuthIdentity" OWNER TO postgres;

--
-- Name: ContactFormMessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ContactFormMessage" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "repliedAt" timestamp(3) without time zone
);


ALTER TABLE public."ContactFormMessage" OWNER TO postgres;

--
-- Name: Conversation; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Conversation" OWNER TO postgres;

--
-- Name: DailyStats; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."DailyStats" OWNER TO postgres;

--
-- Name: DailyStats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."DailyStats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."DailyStats_id_seq" OWNER TO postgres;

--
-- Name: DailyStats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."DailyStats_id_seq" OWNED BY public."DailyStats".id;


--
-- Name: ExpenseType; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."ExpenseType" OWNER TO postgres;

--
-- Name: File; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."File" OWNER TO postgres;

--
-- Name: GLAccount; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."GLAccount" OWNER TO postgres;

--
-- Name: GptResponse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GptResponse" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    content text NOT NULL
);


ALTER TABLE public."GptResponse" OWNER TO postgres;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Invoice" OWNER TO postgres;

--
-- Name: InvoiceLineItem; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."InvoiceLineItem" OWNER TO postgres;

--
-- Name: Lead; Type: TABLE; Schema: public; Owner: postgres
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
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lead" OWNER TO postgres;

--
-- Name: Logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Logs" (
    id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    message text NOT NULL,
    level text NOT NULL
);


ALTER TABLE public."Logs" OWNER TO postgres;

--
-- Name: Logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Logs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Logs_id_seq" OWNER TO postgres;

--
-- Name: Logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Logs_id_seq" OWNED BY public."Logs".id;


--
-- Name: MaintenanceRequest; Type: TABLE; Schema: public; Owner: postgres
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
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."MaintenanceRequest" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Organization" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "poApprovalThreshold" double precision DEFAULT 500 NOT NULL,
    "aiAgentEnabled" boolean DEFAULT true NOT NULL,
    "businessHoursEnd" text DEFAULT '17:00'::text,
    "businessHoursStart" text DEFAULT '09:00'::text,
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
    "emergencyEmail" text,
    "emergencyPhone" text,
    "lastSMSResetDate" timestamp(3) without time zone,
    "monthlySmsCost" double precision DEFAULT 0 NOT NULL,
    "setupCompletedAt" timestamp(3) without time zone,
    "smsCreditsLimit" integer,
    "smsCreditsUsed" integer DEFAULT 0 NOT NULL,
    "smsEnabled" boolean DEFAULT false NOT NULL,
    timezone text DEFAULT 'America/Chicago'::text,
    "twilioBrandSid" text,
    "twilioCampaignSid" text,
    "twilioMessagingServiceSid" text,
    "twilioPhoneNumber" text,
    "twilioPhoneNumberSid" text,
    "voiceEnabled" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Organization" OWNER TO postgres;

--
-- Name: POLineItem; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."POLineItem" OWNER TO postgres;

--
-- Name: PageViewSource; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PageViewSource" (
    name text NOT NULL,
    date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dailyStatsId" integer,
    visitors integer NOT NULL
);


ALTER TABLE public."PageViewSource" OWNER TO postgres;

--
-- Name: PlatformConfig; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."PlatformConfig" OWNER TO postgres;

--
-- Name: ProcessingJob; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."ProcessingJob" OWNER TO postgres;

--
-- Name: Property; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Property" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "organizationId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Property" OWNER TO postgres;

--
-- Name: PurchaseOrder; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."PurchaseOrder" OWNER TO postgres;

--
-- Name: Resident; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Resident" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    description text NOT NULL,
    "time" text DEFAULT '1'::text NOT NULL,
    "isDone" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Task" OWNER TO postgres;

--
-- Name: TwilioPhoneNumber; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."TwilioPhoneNumber" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
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
    credits integer DEFAULT 3 NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: DailyStats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailyStats" ALTER COLUMN id SET DEFAULT nextval('public."DailyStats_id_seq"'::regclass);


--
-- Name: Logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Logs" ALTER COLUMN id SET DEFAULT nextval('public."Logs_id_seq"'::regclass);


--
-- Name: job job_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: postgres
--

ALTER TABLE ONLY pgboss.job
    ADD CONSTRAINT job_pkey PRIMARY KEY (id);


--
-- Name: schedule schedule_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: postgres
--

ALTER TABLE ONLY pgboss.schedule
    ADD CONSTRAINT schedule_pkey PRIMARY KEY (name);


--
-- Name: subscription subscription_pkey; Type: CONSTRAINT; Schema: pgboss; Owner: postgres
--

ALTER TABLE ONLY pgboss.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (event, name);

