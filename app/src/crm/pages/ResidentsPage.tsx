// src/crm/pages/ResidentsPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, getResidents, deleteResident, getProperties } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  User as UserIcon,
  Search,
  Plus,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  Trash2,
  Eye,
  FileDown,
  Upload,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

const STATUS_COLORS: Record<string, any> = {
  ACTIVE: 'default',
  NOTICE_GIVEN: 'secondary',
  PAST_RESIDENT: 'outline',
};

export default function ResidentsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: residents, isLoading, refetch } = useQuery(getResidents, {
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    propertyId: propertyFilter === 'ALL' ? undefined : propertyFilter,
    searchTerm: searchTerm || undefined,
  });

  const { data: properties } = useQuery(getProperties);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete resident ${name}?`)) {
      return;
    }

    try {
      await deleteResident({ id });
      setMessage({ type: 'success', text: 'Resident deleted successfully' });
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete resident' });
    }
  };

  const exportToCSV = () => {
    if (!residents || residents.length === 0) {
      setMessage({ type: 'error', text: 'No residents to export' });
      return;
    }

    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Property',
      'Unit',
      'Monthly Rent',
      'Lease End Date',
      'Status',
    ];

    const rows = residents.map((r: any) => [
      r.firstName,
      r.lastName,
      r.email,
      r.phoneNumber,
      r.property.name,
      r.unitNumber,
      r.monthlyRentAmount,
      new Date(r.leaseEndDate).toLocaleDateString(),
      r.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n'); 

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `residents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage({ type: 'success', text: 'Residents exported to CSV' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const getDaysUntilLeaseEnd = (leaseEndDate: string) => {
    const today = new Date();
    const endDate = new Date(leaseEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getLeaseEndWarning = (resident: any) => {
    const daysUntil = getDaysUntilLeaseEnd(resident.leaseEndDate);
    if (daysUntil < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysUntil <= 30) {
      return <Badge variant="secondary">Expires in {daysUntil}d</Badge>;
    } else if (daysUntil <= 60) {
      return <Badge variant="outline">Expires in {daysUntil}d</Badge>;
    }
    return null;
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Residents</h1>
            <p className="text-muted-foreground mt-2">
              Manage your residents and tenants
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={!residents || residents.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate('/crm/residents/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resident
            </Button>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Residents</p>
                  <p className="text-2xl font-bold">{residents?.length || 0}</p>
                </div>
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Leases</p>
                  <p className="text-2xl font-bold">
                    {residents?.filter((r: any) => r.status === 'ACTIVE').length || 0}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Notice Given</p>
                  <p className="text-2xl font-bold">
                    {residents?.filter((r: any) => r.status === 'NOTICE_GIVEN').length || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold">
                    {residents?.filter((r: any) => {
                      const days = getDaysUntilLeaseEnd(r.leaseEndDate);
                      return days > 0 && days <= 60;
                    }).length || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>All Residents</CardTitle>
              <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search residents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Properties</SelectItem>
                    {properties?.map((prop: any) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="NOTICE_GIVEN">Notice Given</SelectItem>
                    <SelectItem value="PAST_RESIDENT">Past Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading residents...</p>
            ) : residents && residents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property / Unit</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Lease End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((resident: any) => (
                    <TableRow
                      key={resident.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell
                        className="font-medium"
                        onClick={() => navigate(`/crm/residents/${resident.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          {resident.firstName} {resident.lastName}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/crm/residents/${resident.id}`)}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-40">{resident.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {resident.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/crm/residents/${resident.id}`)}>
                        <div className="space-y-1">
                          <div className="font-medium">{resident.property.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Unit {resident.unitNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/crm/residents/${resident.id}`)}>
                        <div className="font-semibold">
                          {formatCurrency(resident.monthlyRentAmount)}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/crm/residents/${resident.id}`)}>
                        <div className="space-y-1">
                          <div>{formatDate(resident.leaseEndDate)}</div>
                          {getLeaseEndWarning(resident)}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => navigate(`/crm/residents/${resident.id}`)}>
                        <Badge variant={STATUS_COLORS[resident.status]}>
                          {resident.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/crm/residents/${resident.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(
                                resident.id,
                                `${resident.firstName} ${resident.lastName}`
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No residents found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm || statusFilter !== 'ALL' || propertyFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first resident'}
                </p>
                {!searchTerm && statusFilter === 'ALL' && propertyFilter === 'ALL' && (
                  <Button className="mt-4" onClick={() => navigate('/crm/residents/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resident
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
