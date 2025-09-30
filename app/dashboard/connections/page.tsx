"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PendingRequest = {
  _id: string;
  fromUser?: any;
  toUser?: any;
  status: string;
  message?: string;
  matchScore?: number;
  createdAt?: string;
};

export default function ConnectionsHubPage() {
  const [loadingIncoming, setLoadingIncoming] = useState(false);
  const [incoming, setIncoming] = useState<PendingRequest[]>([]);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);
  const [outgoing, setOutgoing] = useState<PendingRequest[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadingIncoming(true);
    setLoadingOutgoing(true);
    try {
      const [inRes, outRes] = await Promise.all([
        fetch("/api/connections/pending?role=guide", { cache: "no-store" }),
        fetch("/api/connections/pending?role=seeker", { cache: "no-store" }),
      ]);
      const [inData, outData] = await Promise.all([inRes.json(), outRes.json()]);
      setIncoming(inData.requests || []);
      setOutgoing(outData.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIncoming(false);
      setLoadingOutgoing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const accept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      await fetch("/api/connections/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Connections Hub</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incoming requests (as Guide)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingIncoming ? (
              <div>Loading…</div>
            ) : incoming.length === 0 ? (
              <div>No pending requests.</div>
            ) : (
              <div className="space-y-3">
                {incoming.map((r) => (
                  <div key={r._id} className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">
                        {r.fromUser?.displayName || r.fromUser?.randomUsername || "Seeker"}
                      </div>
                      {typeof r.matchScore === "number" ? (
                        <div className="text-muted-foreground">Match {(r.matchScore * 100).toFixed(0)}%</div>
                      ) : null}
                      {r.message ? <div className="text-muted-foreground">“{r.message}”</div> : null}
                    </div>
                    <Button onClick={() => accept(r._id)} disabled={acceptingId === r._id}>
                      {acceptingId === r._id ? "Accepting…" : "Accept"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outgoing requests (as Seeker)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOutgoing ? (
              <div>Loading…</div>
            ) : outgoing.length === 0 ? (
              <div>No pending requests.</div>
            ) : (
              <div className="space-y-3">
                {outgoing.map((r) => (
                  <div key={r._id} className="flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">
                        {r.toUser?.displayName || r.toUser?.randomUsername || "Guide"}
                      </div>
                      {typeof r.matchScore === "number" ? (
                        <div className="text-muted-foreground">Match {(r.matchScore * 100).toFixed(0)}%</div>
                      ) : null}
                      {r.message ? <div className="text-muted-foreground">“{r.message}”</div> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


