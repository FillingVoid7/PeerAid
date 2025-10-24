"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog } from "@/components/ui/dialog";
import { ModeToggle } from "@/components/ui/ThemeToggle";
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
  Mail,
  CheckCircle,
  XCircle,
  Send,
  ArrowLeft,
  } from "lucide-react";
import { generateAvatar, getAvatarProps } from "@/lib/utilities/avatarGenerator";
import { MatchResult } from "@/lib/Services/matchingService";
import { Toaster, toast } from "sonner";
import { ViewDetails } from "@/components/matching";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";

export default function MatchingPage() {
  const { data: session } = useSession();
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<MatchResult | null>(null);
  const [loadingGuideDetails, setLoadingGuideDetails] = useState(false);
  const [userRole, setUserRole] = useState<'seeker' | 'guide' | null>(null);
  const [seekerMatches, setSeekerMatches] = useState<MatchResult[]>([]);
  const [guideMatches, setGuideMatches] = useState<any[]>([]);

  const [conditionName, setConditionName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  const [receivedRequestIds, setReceivedRequestIds] = useState<Set<string>>(new Set());
  const [acceptedConnectionIds, setAcceptedConnectionIds] = useState<Set<string>>(new Set());
  const [rejectedConnectionIds, setRejectedConnectionIds] = useState<Set<string>>(new Set());
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectedGuideForConnection, setSelectedGuideForConnection] = useState<{ id: string; name: string } | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("");

  const checkConnectionRequests = async (userIds: string[]) => {
    if (userIds.length === 0) return;
    console.log('Checking connection requests for:', userIds);
    setLoadingStatuses(true);
    try {
      const [pendingRes, acceptedRes, rejectedRes] = await Promise.all([
        fetch("/api/connections/pending", { cache: "no-store" }),
        fetch("/api/connections/accepted", { cache: "no-store" }),
        fetch("/api/connections/rejected", { cache: "no-store" })
      ]);
      
      const [pendingData, acceptedData, rejectedData] = await Promise.all([
        pendingRes.json(),
        acceptedRes.json(),
        rejectedRes.json()
      ]);
      
      console.log('Pending API response:', pendingData);
      console.log('Accepted API response:', acceptedData);
      console.log('Rejected API response:', rejectedData);
      
      const sentRequestUserIds = new Set<string>();
      const receivedRequestUserIds = new Set<string>();
      
      if (pendingRes.ok && pendingData.requests) {
        pendingData.requests.forEach((req: any) => {
          console.log('Processing pending request:', {
            fromUser: req.fromUser?._id,
            toUser: req.toUser?._id,
            status: req.status
          });
          
          const fromUserId = req.fromUser?._id || req.fromUser?.id;
          const toUserId = req.toUser?._id || req.toUser?.id;
          
          if (toUserId && userIds.includes(toUserId)) {
            sentRequestUserIds.add(toUserId);
          }
          
          if (fromUserId && userIds.includes(fromUserId)) {
            receivedRequestUserIds.add(fromUserId);
          }
        });
      }
      
      const acceptedUserIds = new Set<string>();
      if (acceptedRes.ok && acceptedData.requests) {
        acceptedData.requests.forEach((req: any) => {
          console.log('Processing accepted request:', {
            fromUser: req.fromUser?._id,
            toUser: req.toUser?._id,
            status: req.status
          });
          
          const fromUserId = req.fromUser?._id || req.fromUser?.id;
          const toUserId = req.toUser?._id || req.toUser?.id;
          
          if (fromUserId && userIds.includes(fromUserId)) {
            acceptedUserIds.add(fromUserId);
            console.log('Added to acceptedUserIds:', fromUserId);
          }
          if (toUserId && userIds.includes(toUserId)) {
            acceptedUserIds.add(toUserId);
            console.log('Added to acceptedUserIds:', toUserId);
          }
        });
      }
      
      const rejectedUserIds = new Set<string>();
      if (rejectedRes.ok && rejectedData.requests) {
        rejectedData.requests.forEach((req: any) => {
          console.log('Processing rejected request:', {
            fromUser: req.fromUser?._id,
            toUser: req.toUser?._id,
            status: req.status
          });
          
          const fromUserId = req.fromUser?._id || req.fromUser?.id;
          const toUserId = req.toUser?._id || req.toUser?.id;
          
          if (fromUserId && userIds.includes(fromUserId)) {
            rejectedUserIds.add(fromUserId);
            console.log('Added to rejectedUserIds:', fromUserId);
          }
          if (toUserId && userIds.includes(toUserId)) {
            rejectedUserIds.add(toUserId);
            console.log('Added to rejectedUserIds:', toUserId);
          }
        });
      }
      
      setSentRequestIds(sentRequestUserIds);
      setReceivedRequestIds(receivedRequestUserIds);
      setAcceptedConnectionIds(acceptedUserIds);
      setRejectedConnectionIds(rejectedUserIds);
      
    } catch (e) {
      console.error('Error checking connection requests:', e);
    } finally {
      setLoadingStatuses(false);
    }
  };

  useEffect(() => {
    const loadMatches = async () => {
      setLoadingMatches(true);
      try {
        const res = await fetch("/api/matching", { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          setUserRole(data.data.userRole || null);
          if (data.data.userRole === 'seeker') {
            setSeekerMatches(data.data.matches || []);
            setMatches(data.data.matches || []);
          } else if (data.data.userRole === 'guide') {
            setGuideMatches(data.data.matches || []);
            setMatches(data.data.matches || []);
          }
          
          const userIds = data.data.matches?.map((match: any) => {
            return data.data.userRole === 'seeker' 
              ? match.guideProfile?.userId?._id 
              : match.seekerProfile?.userId?._id;
          }).filter(Boolean) || [];
          
          console.log('User IDs to check status for:', userIds);
          
          if (userIds.length > 0) {
            await checkConnectionRequests(userIds);
          }
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
    params.set("forRole", userRole === 'seeker' ? "seeker" : "guide");
    return params.toString();
  }, [conditionName, symptoms, location, gender, userRole]);

  const runSearch = async () => {
    setSearching(true);
    try {
      const res = await fetch(`/api/search?${searchParams}`, { cache: "no-store" });
      const data = await res.json();
      const searchResults = data.results || [];
      setResults(searchResults);
      
      // Check connection statuses for search results
      const userIds = searchResults.map((profile: any) => 
        profile.userId?._id || profile.userId?.id
      ).filter(Boolean);
      
      if (userIds.length > 0) {
        await checkConnectionRequests(userIds);
      }
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
    if (!guideUserId) return;
    
    if (sentRequestIds.has(guideUserId)) {
      toast.error("Request already sent to this user");
      return;
    }
    
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
        setSentRequestIds(prev => new Set(prev).add(guideUserId));
        toast.success("Connection request sent successfully!");
      } else {
        if (data.message === "A pending connection request already exists between these users") {
          setSentRequestIds(prev => new Set(prev).add(guideUserId));
          toast.error("Request already sent to this user");
        } else {
          toast.error(data.message || "Failed to send connection request");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection failed");
    } finally {
      setSendingId(null);
    }
  };

  const handleConnectionClick = (guideUserId: string, guideName: string) => {
    if (!guideUserId) return;
    
    if (sentRequestIds.has(guideUserId)) {
      toast.error("Request already sent to this user");
      return;
    }
    
    if (receivedRequestIds.has(guideUserId)) {
      acceptConnectionRequest(guideUserId);
      return;
    }
    
    setSelectedGuideForConnection({ id: guideUserId, name: guideName });
    setConnectionMessage("");
    setConnectionDialogOpen(true);
  };

  const acceptConnectionRequest = async (fromUserId: string) => {
    try {
      const res = await fetch("/api/connections/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setReceivedRequestIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(fromUserId);
          return newSet;
        });
        
        setAcceptedConnectionIds(prev => {
          const newSet = new Set(prev);
          newSet.add(fromUserId);
          return newSet;
        });
        
        toast.success("Connection request accepted!");
      } else {
        toast.error(data.message || "Failed to accept connection request");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to accept connection");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        <div className="flex justify-start pt-4 bg-transparent">
          <DashboardBreadcrumb />
        </div>
        
        {/* Enhanced Header */}
        <div className="text-center space-y-6 pt-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
              {userRole === 'seeker' ? 'Find Your Perfect Guide' : 
               userRole === 'guide' ? 'Find Seekers to Help' : 
               'Find Your Perfect Match'}
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {userRole === 'seeker' ? 'Connect with experienced guides who understand your journey and can provide meaningful support on your path to wellness' :
             userRole === 'guide' ? 'Share your experience and help seekers who could benefit from your guidance and support' :
             'Connect with others who share similar experiences and can provide mutual support'}
          </p>
        </div>

        <Tabs defaultValue="matches" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg p-1">
              <TabsTrigger 
                value="matches" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">{userRole === 'seeker' ? 'Smart Matches' : userRole === 'guide' ? 'Seeker Matches' : 'Smart Matches'}</span>
                <span className="sm:hidden">Matches</span>
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Advanced Search</span>
                <span className="sm:hidden">Search</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="matches" className="space-y-6">
            {loadingMatches ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 dark:border-purple-800"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0"></div>
                </div>
                <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Finding your perfect matches...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment</p>
              </div>
            ) : matches.length === 0 ? (
              <Card className="text-center py-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-lg">
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">No matches found yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    {userRole === 'seeker' ? 'We\'re constantly adding new guides. Try adjusting your profile or check back later for new matches.' :
                     userRole === 'guide' ? 'We\'re constantly adding new seekers. Try adjusting your profile or check back later for new connections.' :
                     'We\'re constantly growing our community. Try adjusting your profile or check back later for new matches.'}
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Target className="w-4 h-4 mr-2" />
                    Try Advanced Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {matches.map((match, idx) => {
                  const profileName = userRole === 'seeker' 
                    ? (match.guideProfile?.userId?.alias || match.guideProfile?.alias || "Guide")
                    : ((match as any).seekerProfile?.userId?.alias || (match as any).seekerProfile?.alias || "Seeker");
                  const profileId = userRole === 'seeker' ? match.guideProfile?._id : (match as any).seekerProfile?._id;
                  const profileUserId = userRole === 'seeker' 
                    ? match.guideProfile?.userId?._id 
                    : (match as any).seekerProfile?.userId?._id;
                  const hasRequestSent = sentRequestIds.has(String(profileUserId));
                  const hasRequestReceived = receivedRequestIds.has(String(profileUserId));
                  const isConnectionAccepted = acceptedConnectionIds.has(String(profileUserId));
                  const isConnectionRejected = rejectedConnectionIds.has(String(profileUserId));
                  const isConnecting = sendingId === String(profileUserId);
                  
                  return (
                    <Card key={idx} className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden relative">
                      {/* Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      <CardHeader className="pb-2 relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10 ring-2 ring-white dark:ring-gray-700 shadow-md">
                                <AvatarImage src={getAvatarProps(profileName, 40).src} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm">
                                  {profileName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                {profileName}
                              </CardTitle>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge className={`${getConnectionStrengthColor(match.connectionStrength)} text-xs font-semibold shadow-sm`}>
                                  {getConnectionStrengthIcon(match.connectionStrength)}
                                  <span className="ml-1 capitalize">{match.connectionStrength} Match</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                              {match.matchScore}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Match Score</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-2 relative z-10">
                        {/* Match Breakdown */}
                        <div className="space-y-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                            Compatibility Analysis
                          </h4>
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Condition Match</span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">{match.breakdown.conditionMatch}%</span>
                              </div>
                              <Progress value={match.breakdown.conditionMatch} className="h-2 bg-gray-200 dark:bg-gray-600" />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Symptom Match</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{match.breakdown.symptomMatch}%</span>
                              </div>
                              <Progress value={match.breakdown.symptomMatch} className="h-2 bg-gray-200 dark:bg-gray-600" />
                            </div>
                          </div>
                        </div>

                        {/* Key Information */}
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center">
                            <Users className="w-4 h-4 mr-2 text-blue-600" />
                            Profile Information
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                          {userRole === 'seeker' ? (
                            <>
                              {match.guideProfile?.conditionName && (
                                <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-800/30">
                                  <Heart className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{match.guideProfile.conditionName}</span>
                                </div>
                              )}
                              {match.guideProfile?.location && (
                                <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800/30">
                                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{match.guideProfile.location}</span>
                                </div>
                              )}
                              {match.guideProfile?.age && (
                                <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800/30">
                                  <Calendar className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{match.guideProfile.age} years old</span>
                                </div>
                              )}
                              {match.guideProfile?.bloodType && (
                                <div className="flex items-center space-x-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded-md border border-pink-100 dark:border-pink-800/30">
                                  <Droplets className="w-4 h-4 text-pink-500 flex-shrink-0" />
                                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">Blood Type: {match.guideProfile.bloodType}</span>
                                </div>
                              )}
                              {match.guideProfile?.verificationMethod && (
                                <div className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800/30">
                                  <Shield className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm capitalize">{match.guideProfile.verificationMethod}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {(match as any).seekerProfile?.conditionName && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span>{(match as any).seekerProfile.conditionName}</span>
                                </div>
                              )}
                              {(match as any).seekerProfile?.location && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-blue-500" />
                                  <span>{(match as any).seekerProfile.location}</span>
                                </div>
                              )}
                              {(match as any).seekerProfile?.age && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Calendar className="w-4 h-4 text-green-500" />
                                  <span>{(match as any).seekerProfile.age} years old</span>
                                </div>
                              )}
                              {(match as any).seekerProfile?.bloodType && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                  <Droplets className="w-4 h-4 text-red-600" />
                                  <span>Blood Type: {(match as any).seekerProfile.bloodType}</span>
                                </div>
                              )}
                            </>
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
                            onClick={() => loadGuideDetails(profileId)}
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-purple-50 hover:border-purple-300"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            disabled={!profileUserId || isConnecting || loadingStatuses || isConnectionAccepted || isConnectionRejected}
                            onClick={() => handleConnectionClick(String(profileUserId), profileName)}
                            size="sm"
                            className={`flex-1 ${
                              isConnectionAccepted
                                ? "bg-green-100 text-green-800 border-green-200 cursor-not-allowed opacity-75 hover:bg-green-100 hover:text-green-800"
                                : isConnectionRejected
                                ? "bg-red-100 text-red-800 border-red-200 cursor-not-allowed opacity-75 hover:bg-red-100 hover:text-red-800"
                                : hasRequestSent 
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed opacity-75 hover:bg-yellow-100 hover:text-yellow-800"
                                : hasRequestReceived
                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            }`}
                          >
                            {loadingStatuses ? (
                              <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : isConnectionAccepted ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Connection Accepted
                              </>
                            ) : isConnectionRejected ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Connection Rejected
                              </>
                            ) : hasRequestSent ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Connection Requested
                              </>
                            ) : hasRequestReceived ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Accept Connection
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
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-900 dark:text-gray-100">Advanced Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition Name</label>
                    <Input
                      placeholder="e.g., Diabetes, Depression"
                      value={conditionName}
                      onChange={(e) => setConditionName(e.target.value)}
                      className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Symptoms</label>
                    <Input
                      placeholder="e.g., fatigue, pain, anxiety"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <Input
                      placeholder="e.g., New York, London"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                    <Input
                      placeholder="e.g., Male, Female, Non-binary"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
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
                      {userRole === 'seeker' ? 'Search Guides' : userRole === 'guide' ? 'Search Seekers' : 'Search'}
                    </>
                  )}
                </Button>

                {results?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Search Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.map((profile: any) => {
                        const profileName = profile.userId?.displayName || profile.userId?.randomUsername || profile.userId?.alias || "Profile";
                        const profileUserId = profile.userId?._id || profile.userId?.id || "";
                        const hasRequestSent = sentRequestIds.has(String(profileUserId));
                        const hasRequestReceived = receivedRequestIds.has(String(profileUserId));
                        const isConnectionAccepted = acceptedConnectionIds.has(String(profileUserId));
                        const isConnectionRejected = rejectedConnectionIds.has(String(profileUserId));
                        const isConnecting = sendingId === String(profileUserId);
                        const profileRole = profile.role || (userRole === 'seeker' ? 'guide' : 'seeker');
                        
                        return (
                          <Card key={profile._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={getAvatarProps(profileName, 40).src} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                                    {profileName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base text-gray-900 dark:text-gray-100">{profileName}</CardTitle>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                      {profileRole === 'seeker' ? 'Seeker' : 'Guide'}
                                    </Badge>
                                    {profile.helpfulCount && (
                                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span>{profile.helpfulCount} helpful</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                                {profile.age && (
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-green-500" />
                                    <span>{profile.age} years old</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                disabled={!profileUserId || isConnecting || isConnectionAccepted || isConnectionRejected}
                                onClick={() => handleConnectionClick(String(profileUserId), profileName)}
                                className={`w-full mt-4 ${
                                  isConnectionAccepted
                                    ? "bg-green-100 text-green-800 border-green-200 cursor-not-allowed opacity-75 hover:bg-green-100 hover:text-green-800"
                                    : isConnectionRejected
                                    ? "bg-red-100 text-red-800 border-red-200 cursor-not-allowed opacity-75 hover:bg-red-100 hover:text-red-800"
                                    : hasRequestSent 
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed opacity-75 hover:bg-yellow-100 hover:text-yellow-800"
                                    : hasRequestReceived
                                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                }`}
                              >
                                {isConnectionAccepted ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Connection Accepted
                                  </>
                                ) : isConnectionRejected ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Connection Rejected
                                  </>
                                ) : hasRequestSent ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Connection Requested
                                  </>
                                ) : hasRequestReceived ? (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Accept Connection
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

        {/* View Details Modal */}
        <ViewDetails 
          selectedGuide={selectedGuide}
          sentRequestIds={sentRequestIds}
          receivedRequestIds={receivedRequestIds}
          acceptedConnectionIds={acceptedConnectionIds}
          rejectedConnectionIds={rejectedConnectionIds}
          sendingId={sendingId}
          onClose={() => setSelectedGuide(null)}
          onConnectionClick={(userId: string, userName: string) => {
            handleConnectionClick(userId, userName);
            setSelectedGuide(null);
          }}
          getConnectionStrengthColor={getConnectionStrengthColor}
          getConnectionStrengthIcon={getConnectionStrengthIcon}
        />
        


        {/* Connection Message Dialog */}
        <Dialog
          isOpen={connectionDialogOpen}
          onClose={() => setConnectionDialogOpen(false)}
          title={`Connect with ${selectedGuideForConnection?.name || 'Guide'}`}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Send a personalized message to introduce yourself and explain why you&apos;d like to connect.
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


