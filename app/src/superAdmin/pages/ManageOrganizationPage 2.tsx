// app/src/superAdmin/pages/ManageOrganizationPage.tsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import {
  getOrganizationByIdSuperAdmin,
  updateOrganizationSuperAdmin,
  deleteOrganizationSuperAdmin,
  createPropertySuperAdmin,
  inviteUserToOrganization,
} from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  ArrowLeft,
  Building2,
  Users,
  Home,
  Phone,
  Settings,
  Trash2,
  Plus,
  Mail,
  UserPlus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';

export default function ManageOrganizationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: organization, isLoading, refetch } = useQuery(getOrganizationByIdSuperAdmin, {
    organizationId: id!,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Property Dialog
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [propertyData, setPropertyData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Add User Dialog
  const [showAddUser, setShowAddUser] = useState(false);
  const [userData, setUserData] = useState({
    email: '',
    role: 'USER',
  });

  if (isLoading) {
    return (
      <div className="py-10 lg:mt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="py-10 lg:mt-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertDescription>Organization not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    try {
      await updateOrganizationSuperAdmin({
        organizationId: id!,
        ...editData,
      });
      setMessage({ type: 'success', text: 'Organization updated successfully' });
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will deactivate the organization.')) return;

    try {
      await deleteOrganizationSuperAdmin({ organizationId: id! });
      setMessage({ type: 'success', text: 'Organization deleted' });
      setTimeout(() => navigate('/superadmin'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleAddProperty = async () => {
    try {
      await createPropertySuperAdmin({
        organizationId: id!,
        ...propertyData,
      });
      setMessage({ type: 'success', text: 'Property created successfully' });
      setShowAddProperty(false);
      setPropertyData({ name: '', code: '', address: '', city: '', state: '', zipCode: '' });
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleAddUser = async () => {
    try {
      await inviteUserToOrganization({
        email: userData.email,
        role: userData.role as any,
      });
      setMessage({ type: 'success', text: 'User invitation sent' });
      setShowAddUser(false);
      setUserData({ email: '', role: 'USER' });
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/superadmin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
              <p className="text-muted-foreground mt-2">Code: {organization.code}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => {
                if (isEditing) {
                  handleUpdate();
                } else {
                  setIsEditing(true);
                  setEditData({
                    name: organization.name,
                    timezone: organization.timezone,
                    businessEmail: organization.businessEmail,
                    businessPhone: organization.businessPhone,
                    isActive: organization.isActive,
                    vapiEnabled: organization.vapiEnabled,
                  });
                }
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Organization Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Input
                      value={editData.timezone}
                      onChange={(e) => setEditData({ ...editData, timezone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Business Email</Label>
                    <Input
                      value={editData.businessEmail || ''}
                      onChange={(e) => setEditData({ ...editData, businessEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Business Phone</Label>
                    <Input
                      value={editData.businessPhone || ''}
                      onChange={(e) => setEditData({ ...editData, businessPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.isActive}
                      onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.vapiEnabled}
                      onChange={(e) => setEditData({ ...editData, vapiEnabled: e.target.checked })}
                    />
                    Vapi Enabled
                  </label>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="font-medium">
                    {organization.isActive ? '✅ Active' : '❌ Inactive'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Vapi</dt>
                  <dd className="font-medium">
                    {organization.vapiEnabled ? '✅ Enabled' : '❌ Disabled'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Timezone</dt>
                  <dd className="font-medium">{organization.timezone}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Business Email</dt>
                  <dd className="font-medium">{organization.businessEmail || 'N/A'}</dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Properties */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Properties ({organization.properties.length})
            </CardTitle>
            <Dialog open={showAddProperty} onOpenChange={setShowAddProperty}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>Create a new property for this organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Property Name *</Label>
                    <Input
                      value={propertyData.name}
                      onChange={(e) => setPropertyData({ ...propertyData, name: e.target.value })}
                      placeholder="Sunset Apartments"
                    />
                  </div>
                  <div>
                    <Label>Property Code *</Label>
                    <Input
                      value={propertyData.code}
                      onChange={(e) =>
                        setPropertyData({ ...propertyData, code: e.target.value.toUpperCase() })
                      }
                      placeholder="SUNSET"
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={propertyData.address}
                      onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={propertyData.city}
                        onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={propertyData.state}
                        onChange={(e) => setPropertyData({ ...propertyData, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Zip</Label>
                      <Input
                        value={propertyData.zipCode}
                        onChange={(e) =>
                          setPropertyData({ ...propertyData, zipCode: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProperty(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProperty}>Create Property</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {organization.properties.length > 0 ? (
              <div className="space-y-2">
                {organization.properties.map((prop: any) => (
                  <div
                    key={prop.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{prop.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {prop.residents.length} residents • {prop.leads.length} leads •{' '}
                        {prop.maintenanceRequests.filter((r: any) =>
                          ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)
                        ).length}{' '}
                        open requests
                      </p>
                    </div>
                    {prop.vapiEnabled && (
                      <Phone className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No properties yet</p>
            )}
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({organization.users.length})
            </CardTitle>
            <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite User</DialogTitle>
                  <DialogDescription>Send an invitation to join this organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={userData.role}
                      onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    >
                      <option value="USER">User</option>
                      <option value="PROPERTY_MANAGER">Property Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {organization.users.length > 0 ? (
              <div className="space-y-2">
                {organization.users.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.username} • {user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No users yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
