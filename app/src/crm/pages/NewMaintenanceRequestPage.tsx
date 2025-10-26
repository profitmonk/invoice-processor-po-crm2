// src/crm/pages/NewMaintenanceRequestPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, createMaintenanceRequest, getResidents, getProperties } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ArrowLeft, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';

const REQUEST_TYPES = [
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'APPLIANCE', label: 'Appliance' },
  { value: 'GENERAL', label: 'General Maintenance' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'PEST_CONTROL', label: 'Pest Control' },
  { value: 'LANDSCAPING', label: 'Landscaping' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', icon: '⚪' },
  { value: 'MEDIUM', label: 'Medium', icon: '🟡' },
  { value: 'HIGH', label: 'High', icon: '🟠' },
  { value: 'EMERGENCY', label: 'Emergency', icon: '🔴' },
];

export default function NewMaintenanceRequestPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [requestType, setRequestType] = useState<string>('GENERAL');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitNumber, setUnitNumber] = useState('');

  // Fetch data
  const { data: properties, isLoading: loadingProperties } = useQuery(getProperties);
  const { data: allResidents, isLoading: loadingResidents } = useQuery(getResidents, {
    status: 'ACTIVE', // Only show active residents
  });

  // Filter residents by selected property
  const residents = selectedPropertyId
    ? allResidents?.filter((r: any) => r.propertyId === selectedPropertyId)
    : [];

  // Auto-fill unit number when resident is selected
  const handleResidentChange = (residentId: string) => {
    setSelectedResidentId(residentId);
    const resident = allResidents?.find((r: any) => r.id === residentId);
    if (resident) {
      setUnitNumber(resident.unitNumber);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!selectedPropertyId) {
      setMessage({ type: 'error', text: 'Please select a property' });
      return;
    }
    if (!selectedResidentId) {
      setMessage({ type: 'error', text: 'Please select a resident' });
      return;
    }
    if (!unitNumber) {
      setMessage({ type: 'error', text: 'Please enter a unit number' });
      return;
    }
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' });
      return;
    }
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please enter a description' });
      return;
    }

    setIsSubmitting(true);

    try {
      await createMaintenanceRequest({
        residentId: selectedResidentId,
        propertyId: selectedPropertyId,
        unitNumber: unitNumber,
        requestType: requestType,
        title: title.trim(),
        description: description.trim(),
        priority: priority,
      });

      setMessage({ type: 'success', text: 'Maintenance request created successfully!' });
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/crm/maintenance');
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create request' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/crm/maintenance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Maintenance Request</h1>
            <p className="text-muted-foreground mt-2">
              Create a new maintenance request for a resident
            </p>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Selection */}
              <div className="space-y-2">
                <Label htmlFor="property">
                  Property <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={(value) => {
                    setSelectedPropertyId(value);
                    setSelectedResidentId(''); // Reset resident when property changes
                    setUnitNumber('');
                  }}
                  disabled={loadingProperties}
                >
                  <SelectTrigger id="property">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties?.map((property: any) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} ({property.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resident Selection */}
              <div className="space-y-2">
                <Label htmlFor="resident">
                  Resident <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedResidentId}
                  onValueChange={handleResidentChange}
                  disabled={!selectedPropertyId || loadingResidents}
                >
                  <SelectTrigger id="resident">
                    <SelectValue placeholder={
                      !selectedPropertyId 
                        ? "Select a property first"
                        : "Select a resident"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {residents?.map((resident: any) => (
                      <SelectItem key={resident.id} value={resident.id}>
                        {resident.firstName} {resident.lastName} - Unit {resident.unitNumber}
                      </SelectItem>
                    ))}
                    {residents?.length === 0 && selectedPropertyId && (
                      <div className="px-2 py-3 text-sm text-muted-foreground">
                        No active residents in this property
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Number (auto-filled but editable) */}
              <div className="space-y-2">
                <Label htmlFor="unitNumber">
                  Unit Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unitNumber"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  placeholder="e.g., 101, A1, Unit 5"
                  disabled={!selectedResidentId}
                />
                <p className="text-xs text-muted-foreground">
                  Auto-filled from resident, but you can change it if needed
                </p>
              </div>

              {/* Request Type */}
              <div className="space-y-2">
                <Label htmlFor="requestType">
                  Request Type <span className="text-destructive">*</span>
                </Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger id="requestType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority <span className="text-destructive">*</span>
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.icon} {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the maintenance issue..."
                  rows={5}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length}/1000 characters
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/crm/maintenance')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Wrench className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="mt-6 bg-muted">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">📝 Instructions</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Select the property where the issue is located</li>
              <li>Choose the resident who reported or is affected by the issue</li>
              <li>The unit number will auto-fill from the resident's profile</li>
              <li>Select the appropriate request type and priority</li>
              <li>Provide a clear title and detailed description</li>
              <li>The request will be created with SUBMITTED status</li>
              <li>It can be assigned to a manager later from the main maintenance page</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
