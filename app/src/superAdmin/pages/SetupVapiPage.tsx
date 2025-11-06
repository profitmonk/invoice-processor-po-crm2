// app/src/superAdmin/pages/SetupVapiPage.tsx
import { useState } from 'react';
import { useAction, useQuery } from 'wasp/client/operations';
import { setupPropertyVapi, getPropertyDetailsSuperAdmin } from 'wasp/client/operations';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupVapiPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [areaCode, setAreaCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: property, isLoading } = useQuery(getPropertyDetailsSuperAdmin, {
    propertyId: propertyId!,
  });

  const setupAction = useAction(setupPropertyVapi) as any;

  const handleSetup = async () => {
    setError('');
    setSuccess('');
    
    try {
      const result = await setupAction({
        propertyId: propertyId!,
        areaCode: areaCode || undefined,
        voiceProvider: '11labs', // FIXED: Change 'elevenlabs' to '11labs'
      });

      if (result.success) {
        setSuccess(`✅ Setup complete! Phone: ${result.phoneNumber}`);
        setTimeout(() => {
          navigate(`/superadmin/organizations/${property?.organizationId}`);
        }, 2000);
      } else {
        setError(result.error || 'Setup failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Property not found</p>
      </div>
    );
  }

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Setup Vapi for {property.name}</h1>
          <p className="text-muted-foreground mt-2">
            Configure AI-powered phone system for this property
          </p>
        </div>

        {property.vapiSetupCompleted ? (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Vapi is already set up for this property.
              <br />
              Phone: <strong>{property.vapiPhoneNumber}</strong>
              <br />
              Assistant ID: <strong>{property.vapiAssistantId?.substring(0, 16)}...</strong>
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Setup Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="areaCode">Area Code (Optional)</Label>
                  <Input
                    id="areaCode"
                    placeholder="e.g. 972, 214, 469"
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    maxLength={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty for any available number
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h3 className="font-semibold">What will happen:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4 list-disc">
                    <li>Purchase a phone number from Vapi ($1.15/month)</li>
                    <li>Create an AI assistant for {property.name}</li>
                    <li>Link the phone number to the assistant</li>
                    <li>Configure webhooks for call handling</li>
                    <li>Enable AI-powered voice responses</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSetup}
                    disabled={setupAction.isLoading}
                    className="flex-1"
                  >
                    {setupAction.isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Setup Vapi Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/superadmin/organizations/${property.organizationId}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{property.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Code:</span>
                <p className="font-medium">{property.code}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Address:</span>
                <p className="font-medium">
                  {property.address}, {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
              {property.aiGreeting && (
                <div>
                  <span className="text-sm text-muted-foreground">AI Greeting:</span>
                  <p className="font-medium">{property.aiGreeting}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
