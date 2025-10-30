// app/src/superAdmin/pages/SuperAdminDashboard.tsx
import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getAllOrganizationsSuperAdmin, getSystemStatisticsSuperAdmin } from 'wasp/client/operations';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Building2,
  Users,
  Home,
  Phone,
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'vapi_enabled' | 'setup_incomplete'>('all');

  const { data: organizations, isLoading: orgsLoading } = useQuery(getAllOrganizationsSuperAdmin, {
    search,
    filter,
  });

  const { data: stats, isLoading: statsLoading } = useQuery(getSystemStatisticsSuperAdmin, {});

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage all organizations and system settings</p>
          </div>
          <Link to="/superadmin/organizations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Organization
            </Button>
          </Link>
        </div>

        {/* System Statistics */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrgs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeOrgs} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.vapiEnabledProperties} with Vapi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalResidents + stats.totalLeads}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalResidents} residents, {stats.totalLeads} leads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalMonthlyCost.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Infrastructure cost</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
              <SelectItem value="vapi_enabled">Vapi Enabled</SelectItem>
              <SelectItem value="setup_incomplete">Setup Incomplete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Organizations List */}
        {orgsLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
        ) : organizations && organizations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {organizations.map((org: any) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{org.name}</h3>
                        <span className="text-sm text-muted-foreground">({org.code})</span>
                        {!org.isActive && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            Inactive
                          </span>
                        )}
                        {org.vapiEnabled && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                            <Phone className="h-3 w-3 inline mr-1" />
                            Vapi Enabled
                          </span>
                        )}
                        {!org.setupCompleted && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            Setup Incomplete
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Properties</p>
                          <p className="text-lg font-semibold">{org.propertyCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Users</p>
                          <p className="text-lg font-semibold">{org.userCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Residents</p>
                          <p className="text-lg font-semibold">{org.residentCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Cost</p>
                          <p className="text-lg font-semibold">
                            ${org.estimatedMonthlyCost.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {org.properties.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Properties:</p>
                          <div className="flex flex-wrap gap-2">
                            {org.properties.map((prop: any) => (
                              <span
                                key={prop.id}
                                className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-700"
                              >
                                {prop.name}
                                {prop.vapiEnabled && (
                                  <Phone className="h-3 w-3 inline ml-1 text-green-600" />
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Link to={`/superadmin/organizations/${org.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                      <Link to={`/superadmin/organizations/${org.id}/properties`}>
                        <Button variant="outline" size="sm">
                          Properties
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first organization
              </p>
              <Link to="/superadmin/organizations/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
