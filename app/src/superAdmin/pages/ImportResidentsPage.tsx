import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { importResidentsCSV } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Upload, Download } from 'lucide-react';

export default function ImportResidentsPage() {
  const { propertyId } = useParams();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    const text = await file.text();
    
    try {
      const res = await importResidentsCSV({ propertyId: propertyId!, csvData: text });
      setResult(res);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'firstName,lastName,email,phoneNumber,unitNumber,monthlyRentAmount,leaseStartDate,leaseEndDate\nJohn,Doe,john@example.com,+14155551234,2B,1500,2024-01-01,2025-01-01';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'residents-template.csv';
    a.click();
  };

  return (
    <div className="py-10 max-w-3xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-8">Import Residents</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSV Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          
          <Button onClick={handleImport} disabled={!file || importing}>
            <Upload className="h-4 w-4 mr-2" />
            {importing ? 'Importing...' : 'Import Residents'}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>
                {result.success ? `✅ Imported ${result.imported}` : `❌ ${result.error}`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
