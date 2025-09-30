"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MatchItem = {
  guideProfile: any;
  matchScore: number;
  sharedSymptoms?: string[];
  effectiveTreatments?: string[];
};

type SearchResult = any;

export default function MatchingPage() {
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);

  const [conditionName, setConditionName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadMatches = async () => {
      setLoadingMatches(true);
      try {
        const res = await fetch("/api/matching/find", { cache: "no-store" });
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMatches(false);
      }
    };
    loadMatches();
  }, []);

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (conditionName) params.set("conditionName", conditionName);
    if (symptoms) params.set("symptoms", symptoms);
    if (location) params.set("location", location);
    if (gender) params.set("gender", gender);
    params.set("forRole", "seeker");
    return params.toString();
  }, [conditionName, symptoms, location, gender]);

  const runSearch = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/search?${searchParams}`, { cache: "no-store" });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const sendConnection = async (guideUserId: string) => {
    if (!guideUserId || sentIds.has(guideUserId)) return;
    setSendingId(guideUserId);
    try {
      const res = await fetch("/api/connections/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: guideUserId }),
      });
      if (res.ok) {
        setSentIds(prev => new Set(prev).add(guideUserId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Matching</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Smart Matches For You</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMatches ? (
            <div>Loading matches…</div>
          ) : matches.length === 0 ? (
            <div>No matches yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{m.guideProfile?.userId?.displayName || m.guideProfile?.userId?.randomUsername || "Guide"}</span>
                      <span className="text-sm">Match {(m.matchScore * 100).toFixed(0)}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {m.sharedSymptoms?.length ? (
                        <div>Shared symptoms: {m.sharedSymptoms.join(", ")}</div>
                      ) : null}
                      {m.guideProfile?.conditionName ? (
                        <div>Condition: {m.guideProfile.conditionName}</div>
                      ) : null}
                      {m.guideProfile?.location ? (
                        <div>Location: {m.guideProfile.location}</div>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      {(() => {
                        const guideUserId = m.guideProfile?.userId?._id || m.guideProfile?.userId?.id || "";
                        const disabled = !guideUserId || sendingId === String(guideUserId) || sentIds.has(String(guideUserId));
                        const label = sentIds.has(String(guideUserId)) ? "Request sent" : (sendingId === String(guideUserId) ? "Sending…" : "Connect");
                        return (
                          <Button disabled={disabled} onClick={() => sendConnection(String(guideUserId))}>
                            {label}
                          </Button>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Condition name"
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
            />
            <Input
              placeholder="Symptoms (comma-separated)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              placeholder="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </div>
          <Button onClick={runSearch} disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </Button>

          {results?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {results.map((p: any) => (
                <Card key={p._id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {p.userId?.displayName || p.userId?.randomUsername || "Profile"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {p.conditionName ? <div>Condition: {p.conditionName}</div> : null}
                      {p.location ? <div>Location: {p.location}</div> : null}
                      {typeof p.helpfulCount === "number" ? (
                        <div>Helpful: {p.helpfulCount}</div>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      {(() => {
                        const guideUserId = p.userId?._id || p.userId?.id || "";
                        const disabled = !guideUserId || sendingId === String(guideUserId) || sentIds.has(String(guideUserId));
                        const label = sentIds.has(String(guideUserId)) ? "Request sent" : (sendingId === String(guideUserId) ? "Sending…" : "Connect");
                        return (
                          <Button disabled={disabled} onClick={() => sendConnection(String(guideUserId))}>
                            {label}
                          </Button>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}


