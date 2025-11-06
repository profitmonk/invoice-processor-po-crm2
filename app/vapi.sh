cat > test-vapi-webhook.sh << 'EOF'
#!/bin/bash

# Replace with your actual secret from .env
SECRET="${VAPI_WEBHOOK_SECRET:639e410363d6b3e04e17ce5291fe4faf081d3888992cc64c72c8e3d6dfb93716}"

PAYLOAD='{"call":{"id":"test-call-123","assistantId":"asst-123","customer":{"number":"+19725551234","name":"John Doe"}}}'

SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

echo "Testing Vapi webhook with signature: $SIGNATURE"

curl -v -X POST http://localhost:3001/api/vapi/call-started \
  -H "Content-Type: application/json" \
  -H "x-vapi-signature: $SIGNATURE" \
  -d "$PAYLOAD"
EOF

chmod +x test-vapi-webhook.sh
./test-vapi-webhook.sh
