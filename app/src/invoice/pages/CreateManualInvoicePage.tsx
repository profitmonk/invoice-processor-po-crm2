import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InvoiceFileUpload from '../components/InvoiceFileUpload';
import { uploadToGCS } from '../utils/fileUpload'; // We'll create this next
import {
  useQuery,
  createManualInvoice,
  getApprovedPOsWithoutInvoices,
  getProperties,
  getGLAccounts,
} from 'wasp/client/operations';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  propertyId: string;
  glAccountId: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
}

export default function CreateManualInvoicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const poId = searchParams.get('poId');

  const { data: approvedPOs } = useQuery(getApprovedPOsWithoutInvoices);
  const { data: properties } = useQuery(getProperties);
  const { data: glAccounts } = useQuery(getGLAccounts);

  const [purchaseOrderId, setPurchaseOrderId] = useState<string>(poId || 'none');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      propertyId: '',
      glAccountId: '',
      quantity: 1,
      unitPrice: 0,
      taxAmount: 0,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadedFileData, setUploadedFileData] = useState<{
    fileName: string;
    fileSize: number;
    fileUrl: string;
    mimeType: string;
  } | null>(null);

  // Pre-fill from PO if selected
  useEffect(() => {
    if (!approvedPOs || !purchaseOrderId || purchaseOrderId === 'none') {
      return;
    }
    
    const po = approvedPOs.find((p: any) => p.id === purchaseOrderId);
    if (po) {
      setVendor(po.vendor || '');
      setDescription(po.description || '');
      if (po.lineItems && Array.isArray(po.lineItems) && po.lineItems.length > 0) {
        setLineItems(
          po.lineItems.map((item: any) => ({
            id: crypto.randomUUID(),
            description: item.description || '',
            propertyId: item.propertyId || '',
            glAccountId: item.glAccountId || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            taxAmount: 0,
          }))
        );
      }
    }
  }, [purchaseOrderId, approvedPOs]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: '',
        propertyId: '',
        glAccountId: '',
        quantity: 1,
        unitPrice: 0,
        taxAmount: 0,
      },
    ]);
  };

  const removeLineItem = (itemId: string) => {
    if (lineItems.length === 1) {
      setMessage({ type: 'error', text: 'Invoice must have at least one line item' });
      return;
    }
    setLineItems(lineItems.filter((item) => item.id !== itemId));
  };

  const updateLineItem = (itemId: string, field: keyof LineItem, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateLineTotal = (item: LineItem) => {
    return item.quantity * item.unitPrice + item.taxAmount;
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotalTax = () => {
    return lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const validateForm = () => {
    if (!invoiceNumber.trim()) {
      setMessage({ type: 'error', text: 'Invoice number is required' });
      return false;
    }

    if (!invoiceDate) {
      setMessage({ type: 'error', text: 'Invoice date is required' });
      return false;
    }

    if (!dueDate) {
      setMessage({ type: 'error', text: 'Due date is required' });
      return false;
    }

    if (!vendor.trim()) {
      setMessage({ type: 'error', text: 'Vendor is required' });
      return false;
    }

    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return false;
    }

    for (const item of lineItems) {
      if (!item.description.trim()) {
        setMessage({ type: 'error', text: 'All line items must have a description' });
        return false;
      }
      if (!item.propertyId) {
        setMessage({ type: 'error', text: 'All line items must have a property' });
        return false;
      }
      if (!item.glAccountId) {
        setMessage({ type: 'error', text: 'All line items must have a GL account' });
        return false;
      }
      if (item.quantity <= 0) {
        setMessage({ type: 'error', text: 'Quantity must be greater than 0' });
        return false;
      }
      if (item.unitPrice < 0) {
        setMessage({ type: 'error', text: 'Unit price cannot be negative' });
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadStatus('uploading');
    setUploadError('');
  
    try {
      // Upload to Google Cloud Storage
      const uploadedFile = await uploadToGCS(file);
      
      setUploadedFileData({
        fileName: file.name,
        fileSize: file.size,
        fileUrl: uploadedFile.url,
        mimeType: file.type,
      });
      setUploadStatus('success');
    } catch (error: any) {
      console.error('File upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
      setUploadStatus('error');
      setSelectedFile(null);
    }
  };
  
  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadedFileData(null);
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    setMessage(null);
  
    try {
      // Debug logs
      console.log('uploadedFileData:', uploadedFileData);
      console.log('selectedFile:', selectedFile);
      console.log('uploadStatus:', uploadStatus);
  
      // Build invoice data
      const invoiceData: any = {
        purchaseOrderId: purchaseOrderId === 'none' ? undefined : purchaseOrderId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        vendor,
        description,
        totalAmount: calculateTotal(),
        taxAmount: calculateTotalTax(),
        lineItems: lineItems.map((item) => ({
          description: item.description,
          propertyId: item.propertyId,
          glAccountId: item.glAccountId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxAmount: item.taxAmount,
        })),
      };
  
      // Add file data if uploaded
      if (uploadedFileData) {
        invoiceData.fileName = uploadedFileData.fileName;
        invoiceData.fileSize = uploadedFileData.fileSize;
        invoiceData.fileUrl = uploadedFileData.fileUrl;
        invoiceData.mimeType = uploadedFileData.mimeType;
      }
  
      console.log('Final invoiceData being sent:', invoiceData);
  
      const invoice = await createManualInvoice(invoiceData);
  
      setMessage({ type: 'success', text: 'Invoice created successfully' });
      setTimeout(() => {
        navigate(`/invoices/manual/${invoice.id}`);
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create invoice' });
    } finally {
      setIsSubmitting(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="py-10 lg:mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/invoices/manual')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
              <p className="text-muted-foreground mt-2">
                Create a manual invoice entry
              </p>
            </div>
          </div>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* File Upload Card - NEW */}
          <InvoiceFileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
            uploadStatus={uploadStatus}
            errorMessage={uploadError}
          />
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the invoice details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="po">Link to Purchase Order (Optional)</Label>
                <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="No PO (create invoice independently)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No PO</SelectItem>
                    {approvedPOs && approvedPOs.length > 0 && approvedPOs.map((po: any) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.poNumber} - {po.vendor} - {formatCurrency(po.totalAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  You can create invoices without a PO. Link them later if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Vendor name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Invoice description"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button onClick={addLineItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      <TableHead>Description *</TableHead>
                      <TableHead>Property *</TableHead>
                      <TableHead>GL Account *</TableHead>
                      <TableHead className="w-[100px]">Qty *</TableHead>
                      <TableHead className="w-[120px]">Unit Price *</TableHead>
                      <TableHead className="w-[120px]">Tax</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(item.id, 'description', e.target.value)
                            }
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.propertyId}
                            onValueChange={(value) =>
                              updateLineItem(item.id, 'propertyId', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {properties?.map((property: any) => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.glAccountId}
                            onValueChange={(value) =>
                              updateLineItem(item.id, 'glAccountId', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {glAccounts?.map((account: any) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.accountNumber} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.taxAmount}
                            onChange={(e) =>
                              updateLineItem(item.id, 'taxAmount', parseFloat(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(calculateLineTotal(item))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.id)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(calculateTotalTax())}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate('/invoices/manual')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
