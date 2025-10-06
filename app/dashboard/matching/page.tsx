"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  MessageCircle, 
  UserCheck,
  TrendingUp,
  Shield,
  Clock,
  Target,
  Sparkles,
  Droplets,
  Stethoscope,
  Phone,
  Mail} from "lucide-react";
import { generateAvatar, getAvatarProps } from "@/lib/utilities/avatarGenerator";
import { MatchResult } from "@/lib/Services/matchingService";
import { Toaster, toast } from "sonner";

type SearchResult = any;

export default function MatchingPage() {
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<MatchResult | null>(null);
  const [loadingGuideDetails, setLoadingGuideDetails] = useState(false);

  const [conditionName, setConditionName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectedGuideForConnection, setSelectedGuideForConnection] = useState<{ id: string; name: string } | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("");

  useEffect(() => {
    const loadMatches = async () => {
      setLoadingMatches(true);
      try {
        const res = await fetch("/api/matching", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setMatches(data.data.matches || []);
        } else {
          console.error('Failed to load matches:', data.error);
        }
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

  const loadGuideDetails = async (guideId: string) => {
    setLoadingGuideDetails(true);
    try {
      const res = await fetch(`/api/matching/${guideId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setSelectedGuide(data.data);
      } else {
        console.error('Failed to load guide details:', data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGuideDetails(false);
    }
  };

  const sendConnection = async (guideUserId: string, message: string = "") => {
    if (!guideUserId || sentIds.has(guideUserId)) return;
    setSendingId(guideUserId);
    
    try {
      const res = await fetch("/api/connections/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          guideId: guideUserId,
          requesterMessage: message 
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSentIds(prev => new Set(prev).add(guideUserId));
        toast.success("Connection request sent successfully!", {
          description: "Your request has been sent to the guide."
        });
      } else {
        toast.error("Failed to send connection request", {
          description: data.message || "Please try again later."
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection failed", {
        description: "Unable to send request. Please check your connection."
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleConnectionClick = (guideUserId: string, guideName: string) => {
    if (!guideUserId || sentIds.has(guideUserId)) return;
    setSelectedGuideForConnection({ id: guideUserId, name: guideName });
    setConnectionMessage("");
    setConnectionDialogOpen(true);
  };

  const handleSendConnection = async () => {
    if (selectedGuideForConnection) {
      await sendConnection(selectedGuideForConnection.id, connectionMessage);
      setConnectionDialogOpen(false);
      setSelectedGuideForConnection(null);
      setConnectionMessage("");
    }
  };

  const getConnectionStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConnectionStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'high': return <Heart className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Find Your Perfect Guide
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced guides who understand your journey and can provide meaningful support
          </p>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Smart Matches</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Advanced Search</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            {loadingMatches ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : matches.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No matches found</h3>
                  <p className="text-gray-500">Try adjusting your profile or check back later for new guides.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {matches.map((match, idx) => {
                  const guideName = match.guideProfile.userId?.alias || match.guideProfile.alias || "Guide";
                  const guideId = match.guideProfile._id;
                  const guideUserId = match.guideProfile.userId?._id;
                  const isConnected = sentIds.has(String(guideUserId));
                  const isConnecting = sendingId === String(guideUserId);
                  
                  return (
                    <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                              <AvatarImage src={getAvatarProps(guideName, 48).src} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                                {guideName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-800">
                                {guideName}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${getConnectionStrengthColor(match.connectionStrength)} text-xs font-medium`}>
                                  {getConnectionStrengthIcon(match.connectionStrength)}
                                  <span className="ml-1 capitalize">{match.connectionStrength} Match</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              {match.matchScore}%
                            </div>
                            <div className="text-xs text-gray-500">Match Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Match Breakdown */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Condition Match</span>
                            <span className="font-medium">{match.breakdown.conditionMatch}%</span>
                          </div>
                          <Progress value={match.breakdown.conditionMatch} className="h-2" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Symptom Match</span>
                            <span className="font-medium">{match.breakdown.symptomMatch}%</span>
                          </div>
                          <Progress value={match.breakdown.symptomMatch} className="h-2" />
                        </div>

                        {/* Key Information */}
                        <div className="space-y-2 text-sm">
                          {match.guideProfile?.conditionName && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>{match.guideProfile.conditionName}</span>
                            </div>
                          )}
                          {match.guideProfile?.location && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span>{match.guideProfile.location}</span>
                            </div>
                          )}
                          {match.guideProfile?.age && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-green-500" />
                              <span>{match.guideProfile.age} years old</span>
                            </div>
                          )}
                          {match.guideProfile?.bloodType && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Droplets className="w-4 h-4 text-red-600" />
                              <span>Blood Type: {match.guideProfile.bloodType}</span>
                            </div>
                          )}
                          {match.guideProfile?.verificationMethod && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Shield className="w-4 h-4 text-purple-500" />
                              <span className="capitalize">{match.guideProfile.verificationMethod}</span>
                            </div>
                          )}
                          {match.sharedSymptoms && match.sharedSymptoms.length > 0 && (
                            <div className="flex items-start space-x-2 text-gray-600">
                              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                              <div>
                                <span className="font-medium">Shared Symptoms:</span>
                                <div className="text-xs mt-1">
                                  {match.sharedSymptoms.slice(0, 2).join(", ")}
                                  {match.sharedSymptoms.length > 2 && ` +${match.sharedSymptoms.length - 2} more`}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Match Explanation */}
                        {match.explanation && (
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700 font-medium">{match.explanation}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={() => loadGuideDetails(guideId)}
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-purple-50 hover:border-purple-300"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            disabled={!guideUserId || isConnecting || isConnected}
                            onClick={() => handleConnectionClick(String(guideUserId), guideName)}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            {isConnected ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Connected
                              </>
                            ) : isConnecting ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              <>
                                <Heart className="w-4 h-4 mr-2" />
                                Connect
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Advanced Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Condition Name</label>
                    <Input
                      placeholder="e.g., Diabetes, Depression"
                      value={conditionName}
                      onChange={(e) => setConditionName(e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Symptoms</label>
                    <Input
                      placeholder="e.g., fatigue, pain, anxiety"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <Input
                      placeholder="e.g., New York, London"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <Input
                      placeholder="e.g., Male, Female, Non-binary"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={runSearch} 
                  disabled={searching}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {searching ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Search Guides
                    </>
                  )}
                </Button>

                {results?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.map((profile: any) => {
                        const profileName = profile.userId?.displayName || profile.userId?.randomUsername || "Profile";
                        const profileUserId = profile.userId?._id || profile.userId?.id || "";
                        const isConnected = sentIds.has(String(profileUserId));
                        const isConnecting = sendingId === String(profileUserId);
                        
                        return (
                          <Card key={profile._id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={getAvatarProps(profileName, 40).src} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                    {profileName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{profileName}</CardTitle>
                                  {profile.helpfulCount && (
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                      <Star className="w-4 h-4 text-yellow-500" />
                                      <span>{profile.helpfulCount} helpful</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm text-gray-600">
                                {profile.conditionName && (
                                  <div className="flex items-center space-x-2">
                                    <Heart className="w-4 h-4 text-red-500" />
                                    <span>{profile.conditionName}</span>
                                  </div>
                                )}
                                {profile.location && (
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span>{profile.location}</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                disabled={!profileUserId || isConnecting || isConnected}
                                onClick={() => handleConnectionClick(String(profileUserId), profileName)}
                                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              >
                                {isConnected ? (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Connected
                                  </>
                                ) : isConnecting ? (
                                  <>
                                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    <Heart className="w-4 h-4 mr-2" />
                                    Connect
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Guide Details Modal */}
        {selectedGuide && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={getAvatarProps(selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide", 64).src} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl">
                        {(selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide"}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${getConnectionStrengthColor(selectedGuide.connectionStrength)} text-sm font-medium`}>
                          {getConnectionStrengthIcon(selectedGuide.connectionStrength)}
                          <span className="ml-1 capitalize">{selectedGuide.connectionStrength} Match</span>
                        </Badge>
                        <span className="text-2xl font-bold text-purple-600">{selectedGuide.matchScore}%</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGuide(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6 p-6">
                {/* Detailed Match Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Match Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Condition Match</span>
                        <span className="font-medium">{selectedGuide.breakdown.conditionMatch}%</span>
                      </div>
                      <Progress value={selectedGuide.breakdown.conditionMatch} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Symptom Match</span>
                        <span className="font-medium">{selectedGuide.breakdown.symptomMatch}%</span>
                      </div>
                      <Progress value={selectedGuide.breakdown.symptomMatch} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Demographics</span>
                        <span className="font-medium">{selectedGuide.breakdown.demographicMatch}%</span>
                      </div>
                      <Progress value={selectedGuide.breakdown.demographicMatch} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Treatments</span>
                        <span className="font-medium">{selectedGuide.breakdown.treatmentMatch}%</span>
                      </div>
                      <Progress value={selectedGuide.breakdown.treatmentMatch} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Guide Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Guide Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedGuide.guideProfile?.conditionName && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                        <Heart className="w-5 h-5 text-red-500" />
                        <div>
                          <div className="font-medium text-gray-800">Condition</div>
                          <div className="text-sm text-gray-600">{selectedGuide.guideProfile.conditionName}</div>
                        </div>
                      </div>
                    )}
                    {selectedGuide.guideProfile?.location && (
                      <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-800">Location</div>
                          <div className="text-sm text-gray-600">{selectedGuide.guideProfile.location}</div>
                        </div>
                      </div>
                    )}
                    {selectedGuide.guideProfile?.age && (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-800">Age</div>
                          <div className="text-sm text-gray-600">{selectedGuide.guideProfile.age} years old</div>
                        </div>
                      </div>
                    )}
                    {selectedGuide.guideProfile?.bloodType && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                        <Droplets className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium text-gray-800">Blood Type</div>
                          <div className="text-sm text-gray-600">{selectedGuide.guideProfile.bloodType}</div>
                        </div>
                      </div>
                    )}
                    {selectedGuide.guideProfile?.gender && (
                      <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-medium text-gray-800">Gender</div>
                          <div className="text-sm text-gray-600 capitalize">{selectedGuide.guideProfile.gender}</div>
                        </div>
                      </div>
                    )}
                    {selectedGuide.guideProfile?.verificationMethod && (
                      <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium text-gray-800">Verification Method</div>
                          <div className="text-sm text-gray-600 capitalize">{selectedGuide.guideProfile.verificationMethod}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Symptoms */}
                {selectedGuide.guideProfile?.symptoms && selectedGuide.guideProfile.symptoms.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">Symptoms</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedGuide.guideProfile.symptoms.map((symptom: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-orange-500" />
                            <span className="font-medium text-gray-800">{symptom.name_of_symptoms}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {symptom.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {symptom.frequency}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diagnosis Information */}
                {selectedGuide.guideProfile?.diagnosis && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">Diagnosis</h3>
                    <div className="p-4 bg-teal-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="font-medium text-gray-800">Diagnosed</div>
                          <div className="text-sm text-gray-600">
                            {selectedGuide.guideProfile.diagnosis.diagnosed ? 'Yes' : 'No'}
                          </div>
                        </div>
                        {selectedGuide.guideProfile.diagnosis.diagnosedBy && (
                          <div>
                            <div className="font-medium text-gray-800">Diagnosed By</div>
                            <div className="text-sm text-gray-600">{selectedGuide.guideProfile.diagnosis.diagnosedBy}</div>
                          </div>
                        )}
                        {selectedGuide.guideProfile.diagnosis.certainty && (
                          <div>
                            <div className="font-medium text-gray-800">Certainty</div>
                            <div className="text-sm text-gray-600 capitalize">{selectedGuide.guideProfile.diagnosis.certainty}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {selectedGuide.guideProfile?.contactInfo && (selectedGuide.guideProfile.contactInfo.contact_email || selectedGuide.guideProfile.contactInfo.contact_phone) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedGuide.guideProfile.contactInfo.contact_email && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-800">Email</div>
                            <div className="text-sm text-gray-600">{selectedGuide.guideProfile.contactInfo.contact_email}</div>
                          </div>
                        </div>
                      )}
                      {selectedGuide.guideProfile.contactInfo.contact_phone && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                          <Phone className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium text-gray-800">Phone</div>
                            <div className="text-sm text-gray-600">{selectedGuide.guideProfile.contactInfo.contact_phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Shared Symptoms */}
                {selectedGuide.sharedSymptoms && selectedGuide.sharedSymptoms.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">Shared Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.sharedSymptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Effective Treatments */}
                {selectedGuide.effectiveTreatments && selectedGuide.effectiveTreatments.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">Effective Treatments</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.effectiveTreatments.map((treatment, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                          {treatment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Explanation */}
                {selectedGuide.explanation && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Why This Match?</h3>
                    <p className="text-gray-700">{selectedGuide.explanation}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedGuide(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      const guideUserId = selectedGuide.guideProfile.userId?._id;
                      const guideName = selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide";
                      if (guideUserId) {
                        handleConnectionClick(String(guideUserId), guideName);
                        setSelectedGuide(null);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Connect Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Connection Message Dialog */}
        <Dialog
          isOpen={connectionDialogOpen}
          onClose={() => setConnectionDialogOpen(false)}
          title={`Connect with ${selectedGuideForConnection?.name || 'Guide'}`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Send a personalized message to introduce yourself and explain why you'd like to connect.
            </p>
            <div className="space-y-2">
              <label htmlFor="connectionMessage" className="text-sm font-medium text-gray-700">
                Your Message (Optional)
              </label>
              <textarea
                id="connectionMessage"
                value={connectionMessage}
                onChange={(e) => setConnectionMessage(e.target.value)}
                placeholder="Hi! I noticed we have similar experiences with [condition]. I'd love to connect and learn from your journey..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500">
                {connectionMessage.length}/500 characters
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setConnectionDialogOpen(false)}
                disabled={sendingId === selectedGuideForConnection?.id}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendConnection}
                disabled={sendingId === selectedGuideForConnection?.id}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {sendingId === selectedGuideForConnection?.id ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </Dialog>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}


