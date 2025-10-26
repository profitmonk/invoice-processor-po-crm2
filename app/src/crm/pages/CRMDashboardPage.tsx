// src/crm/pages/CRMDashboardPage.tsx
// Main CRM Dashboard integrating with existing layout

import { type AuthUser } from 'wasp/auth';
import { useQuery, getResidents, getLeads, getMaintenanceRequests } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../admin/layout/DefaultLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Users,
  UserPlus,
  Wrench,
  AlertCircle,
  Calendar,
  ArrowRight,
  Flame,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const CRMDashboard = ({ user }: { user: AuthUser }) => {
  const navigate = useNavigate();

  // Fetch data for dashboard stats
  const { data: residents, isLoading: loadingResidents } = useQuery(getResidents, {
    status: 'ACTIVE',
  });

  const { data: allResidents } = useQuery(getResidents, {});

  const { data: leads, isLoading: loadingLeads } = useQuery(getLeads, {});

  const { data: maintenanceRequests, isLoading: loadingMaintenance } = useQuery(
    getMaintenanceRequests,
    {}
  );

  // Calculate stats
  const stats = {
    // Residents
    totalResidents: allResidents?.length || 0,
    activeResidents: residents?.length || 0,
    expiringLeases: allResidents?.filter((r: any) => {
      const daysUntil = Math.ceil(
        (new Date(r.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil > 0 && daysUntil <= 60;
    }).length || 0,

    // Leads
    totalLeads: leads?.length || 0,
    hotLeads: leads?.filter((l: any) => l.priority === 'HOT').length || 0,
    newLeads: leads?.filter((l: any) => l.status === 'NEW').length || 0,
    toursScheduled: leads?.filter((l: any) => l.status === 'TOURING_SCHEDULED').length || 0,

    // Maintenance
    totalRequests: maintenanceRequests?.length || 0,
    pendingRequests: maintenanceRequests?.filter((r: any) => r.status === 'SUBMITTED').length || 0,
    inProgressRequests:
      maintenanceRequests?.filter((r: any) =>
        ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)
      ).length || 0,
    emergencyRequests:
      maintenanceRequests?.filter((r: any) => r.priority === 'EMERGENCY').length || 0,

    // Revenue
    monthlyRevenue:
      residents?.reduce((sum: number, r: any) => sum + (r.monthlyRentAmount || 0), 0) || 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isLoading = loadingResidents || loadingLeads || loadingMaintenance;

  // Get recent maintenance requests
  const recentMaintenance = maintenanceRequests
    ?.filter((r: any) => !['COMPLETED', 'CLOSED'].includes(r.status))
    .slice(0, 5);

  // Get recent hot leads
  const recentHotLeads = leads
    ?.filter((l: any) => ['NEW', 'CONTACTED', 'TOURING_SCHEDULED'].includes(l.status))
    .slice(0, 5);

  return (
    <DefaultLayout user={user}>
      <div className="relative">
        <div
          className={cn({
            'opacity-25': isLoading,
          })}
        >
          {/* Main Stats Grid */}
          <div className="2xl:gap-7.5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
            {/* Residents Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/crm/residents')}
            >
              <CardHeader>
                <div className="h-11.5 w-11.5 bg-blue-100 flex items-center justify-center rounded-full">
                  <Users className="size-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="flex justify-between">
                <div>
                  <h4 className="text-title-md text-foreground font-bold">
                    {stats.activeResidents}
                  </h4>
                  <span className="text-muted-foreground text-sm font-medium">
                    Active Residents
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalResidents} total
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Leads Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/crm/leads')}
            >
              <CardHeader>
                <div className="h-11.5 w-11.5 bg-purple-100 flex items-center justify-center rounded-full">
                  <UserPlus className="size-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="flex justify-between">
                <div>
                  <h4 className="text-title-md text-foreground font-bold">{stats.totalLeads}</h4>
                  <span className="text-muted-foreground text-sm font-medium">Active Leads</span>
                  <p className="text-xs text-muted-foreground mt-1">{stats.hotLeads} hot 🔥</p>
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Card */}
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate('/crm/maintenance')}
            >
              <CardHeader>
                <div className="h-11.5 w-11.5 bg-orange-100 flex items-center justify-center rounded-full">
                  <Wrench className="size-6 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="flex justify-between">
                <div>
                  <h4 className="text-title-md text-foreground font-bold">
                    {stats.pendingRequests + stats.inProgressRequests}
                  </h4>
                  <span className="text-muted-foreground text-sm font-medium">Open Requests</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.pendingRequests} pending
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-11.5 w-11.5 bg-green-100 flex items-center justify-center rounded-full">
                  <DollarSign className="size-6 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="flex justify-between">
                <div>
                  <h4 className="text-title-md text-foreground font-bold">
                    {formatCurrency(stats.monthlyRevenue)}
                  </h4>
                  <span className="text-muted-foreground text-sm font-medium">
                    Monthly Revenue
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">From active leases</p>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-success">
                  <TrendingUp className="size-4" />
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Alert Cards */}
          <div className="2xl:gap-7.5 grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 mb-6">
            {/* Expiring Leases */}
            {stats.expiringLeases > 0 && (
              <Card
                className="border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/crm/residents')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900">
                        {stats.expiringLeases} Lease{stats.expiringLeases !== 1 ? 's' : ''}{' '}
                        Expiring Soon
                      </p>
                      <p className="text-sm text-orange-700 mt-1">Within the next 60 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Maintenance */}
            {stats.emergencyRequests > 0 && (
              <Card
                className="border-red-200 bg-red-50 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/crm/maintenance')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Flame className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">
                        {stats.emergencyRequests} Emergency Request
                        {stats.emergencyRequests !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-red-700 mt-1">Requires immediate attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* New Leads */}
            {stats.newLeads > 0 && (
              <Card
                className="border-blue-200 bg-blue-50 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/crm/leads')}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        {stats.newLeads} New Lead{stats.newLeads !== 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">Awaiting first contact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h4 className="text-foreground mb-4 text-lg font-semibold">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
                onClick={() => navigate('/crm/residents/new')}
              >
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Add Resident</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
                onClick={() => navigate('/crm/leads/new')}
              >
                <UserPlus className="h-5 w-5 text-purple-600" />
                <span className="text-sm">Add Lead</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200"
                onClick={() => navigate('/crm/maintenance/new')}
              >
                <Wrench className="h-5 w-5 text-orange-600" />
                <span className="text-sm">New Request</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2 hover:bg-gray-50 hover:border-gray-300"
                onClick={() => navigate('/admin/configuration')}
              >
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm">Properties</span>
              </Button>
            </div>
          </div>

          {/* Recent Activity Grid */}
          <div className="2xl:gap-7.5 grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
            {/* Recent Maintenance */}
            <div className="border-border bg-card shadow-default sm:px-7.5 rounded-sm border px-5 pb-2.5 pt-6 xl:pb-1">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-foreground text-lg font-semibold">Recent Maintenance</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/crm/maintenance')}
                  className="text-xs"
                >
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
              ) : recentMaintenance && recentMaintenance.length > 0 ? (
                <div className="space-y-3 pb-4">
                  {recentMaintenance.map((request: any) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer border border-transparent hover:border-border transition-all"
                      onClick={() => navigate(`/crm/maintenance`)}
                    >
                      <Wrench className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{request.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.resident?.firstName} {request.resident?.lastName} •{' '}
                          {request.property?.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {request.priority === 'EMERGENCY' && '🔴'}
                        {request.priority === 'HIGH' && '🟠'}
                        {request.priority === 'MEDIUM' && '🟡'}
                        {request.priority === 'LOW' && '⚪'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No open maintenance requests</p>
                </div>
              )}
            </div>

            {/* Recent Leads */}
            <div className="border-border bg-card shadow-default sm:px-7.5 rounded-sm border px-5 pb-2.5 pt-6 xl:pb-1">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-foreground text-lg font-semibold">Active Leads</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/crm/leads')}
                  className="text-xs"
                >
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground text-sm py-8 text-center">Loading...</p>
              ) : recentHotLeads && recentHotLeads.length > 0 ? (
                <div className="space-y-3 pb-4">
                  {recentHotLeads.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer border border-transparent hover:border-border transition-all"
                      onClick={() => navigate(`/crm/leads`)}
                    >
                      <UserPlus className="h-4 w-4 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.interestedProperty?.name || 'No property'} •{' '}
                          {lead.status.replace('_', ' ')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lead.priority === 'HOT' && '🔥'}
                        {lead.priority === 'WARM' && '↗️'}
                        {lead.priority === 'COLD' && '❄️'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active leads</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/crm/leads/new')}
                    className="mt-2 text-xs"
                  >
                    Add your first lead
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading && !residents && !leads && !maintenanceRequests && (
          <div className="bg-background/50 absolute inset-0 flex items-start justify-center">
            <div className="bg-card rounded-lg p-8 shadow-lg">
              <p className="text-foreground text-2xl font-bold">Loading CRM data...</p>
              <p className="text-muted-foreground mt-2 text-sm">
                Fetching residents, leads, and maintenance requests
              </p>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default CRMDashboard;
