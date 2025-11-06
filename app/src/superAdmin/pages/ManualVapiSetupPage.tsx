import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getPropertyDetailsSuperAdmin, updatePropertySuperAdmin } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Phone, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManualVapiSetupPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery(getPropertyDetailsSuperAdmin, {
    propertyId: propertyId!,
  });

  const [formData, setFormData] = useState({
    vapiPhoneNumber: '',
    vapiPhoneNumberId: '',
    vapiAssistantId: '',
    aiGreeting: 'Hello! Thank you for calling. How can I help you today?',
    aiPersonality: 'professional and helpful',
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    emergencyPhone: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updatePropertySuperAdmin({
        propertyId: propertyId!,
        vapiPhoneNumber: formData.vapiPhoneNumber,
        vapiPhoneNumberId: formData.vapiPhoneNumberId || undefined,
        vapiAssistantId: formData.vapiAssistantId,
        vapiEnabled: true,
        vapiSetupCompleted: true,
        aiGreeting: formData.aiGreeting,
        aiPersonality: formData.aiPersonality,
        businessHoursStart: formData.businessHoursStart,
        businessHoursEnd: formData.businessHoursEnd,
        emergencyPhone: formData.emergencyPhone || undefined,
        vapiActivatedAt: new Date(),
      });

      setMessage({ type: 'success', text: 'VAPI setup saved successfully!' });
      
      setTimeout(() => {
        navigate(`/superadmin/organizations/${property?.organizationId}`);
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save setup' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  if (!property) {
    return <div className="py-10 text-center">Property not found</div>;
  }

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/superadmin/organizations/${property.organizationId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manual VAPI Setup</h1>
            <p className="text-muted-foreground mt-2">
              {property.name} ({property.code})
            </p>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* VAPI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                VAPI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vapiPhoneNumber">Phone Number *</Label>
                <Input
                  id="vapiPhoneNumber"
                  placeholder="+14155551234"
                  value={formData.vapiPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, vapiPhoneNumber: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Format: +1XXXXXXXXXX (include country code)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vapiPhoneNumberId">Phone Number ID (Optional)</Label>
                <Input
                  id="vapiPhoneNumberId"
                  placeholder="pn_abc123..."
                  value={formData.vapiPhoneNumberId}
                  onChange={(e) => setFormData({ ...formData, vapiPhoneNumberId: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  VAPI's internal phone number ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vapiAssistantId">Assistant ID *</Label>
                <Input
                  id="vapiAssistantId"
                  placeholder="asst_abc123..."
                  value={formData.vapiAssistantId}
                  onChange={(e) => setFormData({ ...formData, vapiAssistantId: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  VAPI's AI assistant ID
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiGreeting">Greeting Message</Label>
                <Input
                  id="aiGreeting"
                  placeholder="Hello! How can I help you?"
                  value={formData.aiGreeting}
                  onChange={(e) => setFormData({ ...formData, aiGreeting: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiPersonality">AI Personality</Label>
                <Input
                  id="aiPersonality"
                  placeholder="professional and helpful"
                  value={formData.aiPersonality}
                  onChange={(e) => setFormData({ ...formData, aiPersonality: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessHoursStart">Business Hours Start</Label>
                  <Input
                    id="businessHoursStart"
                    type="time"
                    value={formData.businessHoursStart}
                    onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessHoursEnd">Business Hours End</Label>
                  <Input
                    id="businessHoursEnd"
                    type="time"
                    value={formData.businessHoursEnd}
                    onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="+14155559999"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Property manager's phone for notifications
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal ml-4">
                <li>Go to <a href="https://dashboard.vapi.ai" target="_blank" className="text-blue-600 underline">VAPI Dashboard</a></li>
                <li>Purchase a phone number (Phone Numbers → Buy Number)</li>
                <li>Copy the phone number (e.g., +14155551234)</li>
                <li>Create an assistant (Assistants → New Assistant)</li>
                <li>Copy the assistant ID (starts with "asst_")</li>
                <li>Link phone number to assistant in VAPI dashboard</li>
                <li>Paste the values above and click Save</li>
              </ol>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to={`/superadmin/organizations/${property.organizationId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save VAPI Setup'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
