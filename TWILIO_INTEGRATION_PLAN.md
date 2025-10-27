# Phase 7: Twilio & AI Integration Plan

**Status:** Ready to Begin  
**Date:** January 28, 2025  
**Estimated Time:** 2-4 hours (excluding approval wait times)

---

## 📋 Prerequisites Checklist

### ✅ Already Complete
- [x] Twilio services code written
- [x] Webhook handlers implemented
- [x] AI agent service ready
- [x] SMS service with rate limiting
- [x] Campaign management operations
- [x] Database schema complete
- [x] Frontend pages ready

### ⏳ Need to Complete
- [ ] Twilio account created
- [ ] Trust Hub verified (2-3 days)
- [ ] OpenAI API key obtained
- [ ] Environment variables set
- [ ] Test organization created
- [ ] Phone number purchased
- [ ] Campaign registered

---

## 🎯 Phase 7 Goals

1. **Setup Twilio Account** - Get trial account with $15 credit
2. **Trust Hub Verification** - Complete business verification (2-3 days)
3. **Brand Registration** - Register your platform as a brand
4. **Test SMS Flow** - Send and receive SMS messages
5. **AI Integration** - Test AI agent responses
6. **WhatsApp Setup** - Configure WhatsApp Business API

---

## 📝 Step-by-Step Integration Guide

### **Step 1: Create Twilio Account (30 minutes)**

1. Go to https://www.twilio.com/try-twilio
2. Sign up for free trial ($15 credit)
3. Verify your email and phone number
4. Note down:
   - Account SID
   - Auth Token
   - Your Twilio phone number (for testing)

### **Step 2: Trust Hub Verification (2-3 days wait)**

1. Go to Trust Hub in Twilio Console
2. Complete Business Profile:
   - Business name
   - Address
   - Tax ID (EIN)
   - Website
   - Business type
3. Upload required documents:
   - Business registration
   - Address proof
4. Submit for verification
5. **Wait 2-3 days for approval**

### **Step 3: Register Your Brand (1 hour)**

```typescript
// Use your existing code in campaignService.ts
// You already have this function ready:

const brand = await registerPlatformBrand({
  brandName: "PropertyHub CRM",
  companyName: "Your Company LLC",
  website: "https://yourdomain.com",
  vertical: "REAL_ESTATE",
  ein: "XX-XXXXXXX",
  businessAddress: {
    street: "123 Main St",
    city: "Your City",
    state: "CA",
    postalCode: "12345",
    country: "US"
  },
  contactEmail: "contact@yourdomain.com",
  contactPhone: "+1234567890"
});
```

**What you need:**
- Your company EIN (Tax ID)
- Business address
- Company website
- Contact information

**Cost:** $4 one-time registration fee

### **Step 4: Purchase Test Phone Number (5 minutes)**

```typescript
// Use your existing phoneService.ts
const phoneNumber = await purchasePhoneNumber({
  organizationId: "test-org-id",
  areaCode: "415", // Your preferred area code
});
```

**Cost:** $1.15/month

### **Step 5: Register First Campaign (30 minutes)**

```typescript
// Use your existing campaignService.ts
const campaign = await registerCampaign({
  organizationId: "test-org-id",
  brandId: brand.brandId,
  useCase: "MIXED", // Mixed customer care and marketing
  description: "Property management communication for residents",
  messageSamples: [
    "Your maintenance request has been received.",
    "Reminder: Rent payment due on 1st",
    "Your package has arrived at the office"
  ],
  optInType: "VERBAL",
  optInDescription: "Residents provide verbal consent during lease signing",
  helpMessage: "Reply HELP for assistance",
  stopMessage: "Reply STOP to unsubscribe"
});
```

**Cost:** $10/month per campaign  
**Approval Time:** 1-3 days

### **Step 6: Update Environment Variables (5 minutes)**

```bash
# .env.server
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_BRAND_ID=BNxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
```

### **Step 7: Configure Webhooks (15 minutes)**

In Twilio Console:

1. Go to Phone Numbers → Manage → Active Numbers
2. Click your purchased number
3. Configure webhooks:

```
SMS Incoming:
https://yourdomain.com/twilio/webhook/sms

Voice Incoming:
https://yourdomain.com/twilio/webhook/voice

Status Callback:
https://yourdomain.com/twilio/webhook/status
```

**For Local Testing:**
```bash
# Install ngrok
brew install ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in webhooks
https://your-ngrok-url.ngrok.io/twilio/webhook/sms
```

### **Step 8: Test SMS Send (10 minutes)**

```typescript
// In Wasp console or test file
import { sendSMS } from '@src/crm/twilio/smsService';

await sendSMS({
  organizationId: "test-org-id",
  to: "+1234567890", // Your verified phone number
  message: "Test message from PropertyHub CRM!",
  residentId: "resident-id-here"
});
```

**Expected Result:**
- SMS delivered to your phone
- Status logged in database
- Conversation record created

### **Step 9: Test SMS Receive (10 minutes)**

1. Reply to the test SMS from your phone
2. Check webhook logs in Wasp console
3. Verify AI agent responds
4. Check conversation in database

**Expected Flow:**
```
You: "Hello"
  ↓
Twilio receives SMS
  ↓
Webhook triggers
  ↓
AI agent processes
  ↓
AI generates response
  ↓
SMS sent back to you
```

### **Step 10: Test AI Agent (20 minutes)**

```typescript
// Test in Wasp console
import { generateAIResponse } from '@src/crm/ai/aiAgent';

const response = await generateAIResponse({
  residentName: "John Doe",
  propertyName: "Sunset Apartments",
  conversationHistory: [
    { role: "user", content: "My AC is not working" }
  ],
  userMessage: "It's been broken since yesterday"
});

console.log(response);
```

**Expected Output:**
- Contextual response about AC issue
- Offers to create maintenance request
- Professional and helpful tone

---

## 🔧 WhatsApp Integration (Phase 8 Preview)

### Prerequisites
- Twilio account verified ✅
- WhatsApp Business API access (request from Twilio)
- Facebook Business Manager account
- WhatsApp message templates approved

### Setup Steps (Will do after SMS working)
1. Request WhatsApp API access from Twilio
2. Link Facebook Business Manager
3. Create message templates
4. Submit templates for approval (24-48 hours)
5. Configure WhatsApp webhooks
6. Test message flow
7. Integrate AI agent for WhatsApp

**Cost:** $0.005 per conversation (first 1000 free)

---

## 🧪 Testing Checklist

### SMS Flow Testing
- [ ] Send SMS to verified number
- [ ] Receive SMS response
- [ ] Check database records
- [ ] Verify conversation threading
- [ ] Test rate limiting (30/min, 250/hour)
- [ ] Test error handling
- [ ] Test AI responses

### AI Agent Testing
- [ ] Test basic conversation
- [ ] Test maintenance request intent
- [ ] Test FAQ responses
- [ ] Test context awareness
- [ ] Test multi-turn conversations
- [ ] Test error scenarios

### Webhook Testing
- [ ] SMS receive webhook
- [ ] Status callback webhook
- [ ] Voice webhook (optional)
- [ ] Error handling
- [ ] Logging and monitoring

### Campaign Testing
- [ ] Register campaign
- [ ] Check approval status
- [ ] Test usage tracking
- [ ] Test limits (30/min, 250/hour)
- [ ] Test suspend/reactivate

---

## 💰 Cost Breakdown

### One-Time Costs
- Brand Registration: $4
- Trust Hub: Free
- OpenAI Setup: Free

### Monthly Costs (Per Organization)
- Phone Number: $1.15/month
- Campaign: $10/month
- **Base:** $11.15/month

### Usage Costs
- SMS Outbound: $0.0079/message
- SMS Inbound: $0.0079/message
- WhatsApp: $0.005/conversation
- OpenAI: ~$0.002/message (GPT-4 turbo)

### Example: 100 messages/month
- SMS: 100 × $0.0079 = $0.79
- OpenAI: 100 × $0.002 = $0.20
- **Total Usage:** ~$1/month
- **Total with Base:** ~$12.15/month

---

## 🚨 Common Issues & Solutions

### Issue: Trust Hub Verification Delayed
**Solution:** Ensure all documents are clear and match exactly. Check spam folder for Twilio emails.

### Issue: Campaign Rejected
**Solution:** Review message samples, ensure opt-in is clear, check brand information is accurate.

### Issue: SMS Not Delivered
**Solution:** Check phone number format (+1...), verify campaign is approved, check rate limits.

### Issue: Webhook Not Triggered
**Solution:** Check ngrok is running, verify webhook URLs in Twilio console, check firewall settings.

### Issue: AI Response Slow
**Solution:** Optimize prompt, use GPT-4 turbo, implement caching, reduce conversation history.

### Issue: Rate Limit Hit
**Solution:** Implement queue system, spread messages over time, increase campaign limits.

---

## 📊 Success Metrics

### Must Have (MVP)
- [ ] SMS send working
- [ ] SMS receive working
- [ ] AI responses working
- [ ] Webhooks functioning
- [ ] Database recording conversations
- [ ] Campaign limits enforced

### Nice to Have
- [ ] WhatsApp working
- [ ] Voice calls working
- [ ] Multi-turn conversations smooth
- [ ] Response time < 3 seconds
- [ ] 99% delivery rate

---

## 🎯 Next Steps After Phase 7

1. **Phase 8:** WhatsApp Integration
2. **Phase 9:** Production Deployment
3. **Phase 10:** Beta Testing with Real Organizations
4. **Phase 11:** Launch and Scale

---

## 📞 Support Resources

### Twilio
- **Docs:** https://www.twilio.com/docs
- **Console:** https://console.twilio.com
- **Support:** https://support.twilio.com
- **Community:** https://community.twilio.com

### OpenAI
- **Docs:** https://platform.openai.com/docs
- **Playground:** https://platform.openai.com/playground
- **Status:** https://status.openai.com

### Wasp
- **Docs:** https://wasp-lang.dev/docs
- **Discord:** https://discord.gg/aCamt5wCpS

---

**Ready to bring your CRM to life with real SMS and AI! 🚀📱🤖**

Let me know when you're ready to start Phase 7!
