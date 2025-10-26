// src/crm/pages/MaintenancePage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuery,
  getMaintenanceRequests,
  updateMaintenanceStatus,
  deleteMaintenanceRequest,
  getProperties,
} from 'wasp/client/operations';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import {
  Wrench,
  Search,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Flame,
  Eye,
  Trash2,
  Building2,
  User,
  Phone,
  FileDown,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

const STATUS_CONFIG: Record<string, any> = {
  SUBMITTED: {
    label: 'Submitted',
    icon: Clock,
    color: 'default',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  ASSIGNED: {
    label: 'Assigned',
    icon: User,
    color: 'secondary',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Wrench,
    color: 'default',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'default',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
  },
  CLOSED: {
    label: 'Closed',
    icon: XCircle,
    color: 'outline',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'destructive',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
  },
};

const PRIORITY_CONFIG: Record<string, any> = {
  LOW: { label: 'Low', color: 'outline', icon: '⚪' },
  MEDIUM: { label: 'Medium', color: 'default', icon: '🟡' },
  HIGH: { label: 'High', color: 'secondary', icon: '🟠' },
  EMERGENCY: { label: 'Emergency', color: 'destructive', icon: '🔴' },
};

const REQUEST_TYPES = [
  'PLUMBING',
  'HVAC',
  'ELECTRICAL',
  'APPLIANCE',
  'GENERAL',
  'EMERGENCY',
  'PEST_CONTROL',
  'LANDSCAPING',
  'SECURITY',
  'OTHER',
];

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE'); // ACTIVE = not COMPLETED/CLOSED
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Status update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Build query args
  const queryArgs: any = {
    priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
    propertyId: propertyFilter === 'ALL' ? undefined : propertyFilter,
    requestType: typeFilter === 'ALL' ? undefined : typeFilter,
    searchTerm: searchTerm || undefined,
  };

  // Handle status filter - ACTIVE means not completed/closed
  if (statusFilter === 'ACTIVE') {
    // This will be filtered client-side since Prisma doesn't support NOT IN easily
  } else if (statusFilter !== 'ALL') {
    queryArgs.status = statusFilter;
  }

  const { data: allRequests, isLoading, refetch } = useQuery(
    getMaintenanceRequests,
    queryArgs
  );

  const { data: properties } = useQuery(getProperties);

  // Client-side filter for ACTIVE status
  const requests =
    statusFilter === 'ACTIVE'
      ? allRequests?.filter(
          (r: any) => !['COMPLETED', 'CLOSED', 'CANCELLED'].includes(r.status)
        )
      : allRequests;

  const handleStatusChange = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      await updateMaintenanceStatus({
        id: selectedRequest.id,
        status: newStatus,
        resolutionNotes: resolutionNotes || undefined,
      });
      setMessage({ type: 'success', text: 'Status updated successfully' });
      refetch();
      setUpdateDialogOpen(false);
      setSelectedRequest(null);
      setNewStatus('');
      setResolutionNotes('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update status' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteMaintenanceRequest({ id });
      setMessage({ type: 'success', text: 'Request deleted successfully' });
      refetch();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete request' });
    }
  };

  const openStatusDialog = (request: any) => {
    setSelectedRequest(request);
    setNewStatus(request.status);
    setResolutionNotes('');
    setUpdateDialogOpen(true);
  };

  const exportToCSV = () => {
    if (!requests || requests.length === 0) {
      setMessage({ type: 'error', text: 'No requests to export' });
      return;
    }

    const headers = [
      'ID',
      'Title',
      'Type',
      'Priority',
      'Status',
      'Resident',
      'Property',
      'Unit',
      'Created Date',
      'Completed Date',
      'Assigned To',
    ];

    const rows = requests.map((r: any) => [
      r.id,
      r.title,
      r.requestType,
      r.priority,
      r.status,
      `${r.resident.firstName} ${r.resident.lastName}`,
      r.property.name,
      r.unitNumber,
      new Date(r.createdAt).toLocaleDateString(),
      r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '',
      r.assignedManager?.username || r.assignedToName || 'Unassigned',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `maintenance_requests_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage({ type: 'success', text: 'Exported to CSV' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.SUBMITTED;
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  };

  // Calculate stats
  const stats = {
    total: allRequests?.length || 0,
    submitted: allRequests?.filter((r: any) => r.status === 'SUBMITTED').length || 0,
    inProgress:
      allRequests?.filter((r: any) => ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length ||
      0,
    completed: allRequests?.filter((r: any) => r.status === 'COMPLETED').length || 0,
    emergency: allRequests?.filter((r: any) => r.priority === 'EMERGENCY').length || 0,
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
            <p className="text-muted-foreground mt-2">
              Track and manage all maintenance requests
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={!requests || requests.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate('/crm/maintenance/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {message && (
          <Alert
            variant={message.type === 'error' ? 'destructive' : 'default'}
            className="mb-6"
          >
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Wrench className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New</p>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Emergency</p>
                  <p className="text-2xl font-bold">{stats.emergency}</p>
                </div>
                <Flame className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">🔵 Active</SelectItem>
                  <SelectItem value="SUBMITTED">⏱️ Submitted</SelectItem>
                  <SelectItem value="ASSIGNED">👤 Assigned</SelectItem>
                  <SelectItem value="IN_PROGRESS">🔧 In Progress</SelectItem>
                  <SelectItem value="COMPLETED">✅ Completed</SelectItem>
                  <SelectItem value="CLOSED">⚪ Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="EMERGENCY">🔴 Emergency</SelectItem>
                  <SelectItem value="HIGH">🟠 High</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                  <SelectItem value="LOW">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-48">
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === 'ACTIVE' ? 'Active ' : ''}
              {statusFilter !== 'ALL' && statusFilter !== 'ACTIVE'
                ? `${statusFilter} `
                : ''}
              Maintenance Requests ({requests?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading requests...</p>
            ) : requests && requests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Resident / Unit</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request: any) => {
                    const statusConfig = getStatusConfig(request.status);
                    const priorityConfig = getPriorityConfig(request.priority);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <TableRow
                        key={request.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/crm/maintenance/${request.id}`)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold">{request.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {request.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {request.resident.firstName} {request.resident.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Unit {request.unitNumber}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {request.resident.phoneNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{request.property.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {request.requestType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityConfig.color}>
                            {priorityConfig.icon} {priorityConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(request.createdAt)}</div>
                          {request.completedAt && (
                            <div className="text-xs text-muted-foreground">
                              Done: {formatDate(request.completedAt)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openStatusDialog(request);
                              }}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/crm/maintenance/${request.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'SUBMITTED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(request.id, request.title);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No maintenance requests found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first request'}
                </p>
                {!searchTerm && statusFilter === 'ALL' && priorityFilter === 'ALL' && (
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/crm/maintenance/new')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Update Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Request Status</DialogTitle>
              <DialogDescription>
                Change the status of "{selectedRequest?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Resolution Notes (Optional)
                </label>
                <Textarea
                  placeholder="Add notes about this status change..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange}>Update Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
