// app/src/superAdmin/pages/CreateOrganizationPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganizationSuperAdmin } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ArrowLeft, Building2, User, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateOrganizationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    adminEmail: '',
    adminPassword: '',
    timezone: 'America/Los_Angeles',
    businessEmail: '',
    businessPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setGeneratedPassword(null);

    try {
      const result = await createOrganizationSuperAdmin({
        name: formData.name,
        code: formData.code.toUpperCase(),
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword || undefined,
        timezone: formData.timezone,
        businessEmail: formData.businessEmail || undefined,
        businessPhone: formData.businessPhone || undefined,
      });

      if (result.generatedPassword) {
        setGeneratedPassword(result.generatedPassword);
      }

      setMessage({
        type: 'success',
        text: 'Organization created successfully!',
      });

      setTimeout(() => {
        navigate(`/superadmin/organizations/${result.organization.id}`);
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create organization',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/superadmin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Organization</h1>
            <p className="text-muted-foreground mt-2">
              Set up a new organization with an admin user
            </p>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {generatedPassword && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertDescription>
              <p className="font-semibold mb-2">⚠️ Save this password - it won't be shown again!</p>
              <div className="bg-white p-3 rounded border border-yellow-300 font-mono text-sm">
                {generatedPassword}
              </div>
              <p className="text-xs mt-2">
                Admin email: {formData.adminEmail}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Details
              </CardTitle>
              <CardDescription>Basic information about the organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    placeholder="Sunset Property Management"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Organization Code *</Label>
                  <Input
                    id="code"
                    placeholder="SUNSET"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    maxLength={10}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier (letters/numbers only)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="contact@sunset.com"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    placeholder="+1-555-123-4567"
                    value={formData.businessPhone}
                    onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                >
                  <option value="America/Los_Angeles">Pacific Time (US)</option>
                  <option value="America/Denver">Mountain Time (US)</option>
                  <option value="America/Chicago">Central Time (US)</option>
                  <option value="America/New_York">Eastern Time (US)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Admin User */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Admin User
              </CardTitle>
              <CardDescription>Create the primary administrator account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="admin@sunset.com"
                    className="pl-10"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminPassword">Admin Password (Optional)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Leave empty to auto-generate"
                    className="pl-10"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If left empty, a secure password will be generated
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Link to="/superadmin">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
