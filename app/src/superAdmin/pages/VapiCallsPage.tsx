import { useQuery } from 'wasp/client/operations';
import { getRecentVapiCalls } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function VapiCallsPage() {
  const { data: calls, isLoading } = useQuery(getRecentVapiCalls, {});

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="py-10 max-w-7xl mx-auto px-6">
      <h1 className="text-3xl font-bold mb-8">VAPI Call Logs</h1>
      
      <div className="space-y-4">
        {calls?.map((call: any) => (
          <Card key={call.id}>
            <CardHeader>
              <CardTitle>
                {call.property.name} - {call.callerPhone}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {call.callStatus}</p>
                <p><strong>Duration:</strong> {call.durationSeconds}s</p>
                <p><strong>Time:</strong> {new Date(call.startedAt).toLocaleString()}</p>
                {call.transcript && (
                  <details>
                    <summary className="cursor-pointer font-semibold">Transcript</summary>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{call.transcript}</p>
                  </details>
                )}
                {call.maintenanceRequest && (
                  <p className="text-green-600">
                    ✅ Created Request #{call.maintenanceRequest.id.slice(0, 8)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
