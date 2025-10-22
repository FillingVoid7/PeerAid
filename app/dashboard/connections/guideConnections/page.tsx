"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModeToggle } from "@/components/ui/ThemeToggle";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  UserCheck,
  Heart,
  MapPin,
  Calendar,
  Stethoscope,
  Send,
  User,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Home,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Award,
  Target
} from "lucide-react";
import { generateAvatar, getAvatarProps } from "@/lib/utilities/avatarGenerator";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Toaster, toast } from "sonner";
import { Skeleton } from "@/components/isLoading";

interface ConnectionRequest {
  _id: string;
  fromUser: {
    _id: string;
    alias: string;
    email: string;
  };
  toUser: {
    _id: string;
    alias: string;
    email: string;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface ConnectionWithProfile extends ConnectionRequest {
  seekerProfile?: {
    _id: string;
    userId: string;
    alias: string;
    condition: string;
    symptoms: string[];
    location: string;
    gender: string;
    age: number;
    diagnosisDate: string;
    supportType: string[];
  };
}

const ITEMS_PER_PAGE = 6;

export default function GuideConnectionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [connections, setConnections] = useState<{
    pending: ConnectionWithProfile[];
    accepted: ConnectionWithProfile[];
    rejected: ConnectionWithProfile[];
  }>({
    pending: [],
    accepted: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState({
    pending: 1,
    accepted: 1,
    rejected: 1
  });
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const fetchConnections = async (type: string) => {
    try {
      const res = await fetch(`/api/connections/${type}`);
      const data = await res.json();
      
      if (res.ok && data.requests) {
        const guideConnections = data.requests.filter((req: ConnectionRequest) => 
          req.toUser._id === session?.user?.id
        );

        const connectionsWithProfiles = await Promise.all(
          guideConnections.map(async (connection: ConnectionRequest) => {
            try {
              const profileRes = await fetch(`/api/get-profile/${connection.fromUser._id}`);
              const profileData = await profileRes.json();
              
              return {
                ...connection,
                seekerProfile: profileData.success ? profileData.profile : null
              };
            } catch (error) {
              console.error(`Error fetching profile for ${connection.fromUser._id}:`, error);
              return connection;
            }
          })
        );

        return connectionsWithProfiles;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${type} connections:`, error);
      toast.error(`Failed to load ${type} connections`);
      return [];
    }
  };

  const lastLoadedAtRef = useRef<number>(0);
  const REFRESH_TTL_MS = 300000; 

  const loadAllConnections = async (force: boolean = false) => {
    if (!force) {
      const now = Date.now();
      if (now - lastLoadedAtRef.current < REFRESH_TTL_MS) {
        return; 
      }
    }
    setLoading(true);
    try {
      const [pending, accepted, rejected] = await Promise.all([
        fetchConnections('pending'),
        fetchConnections('accepted'),
        fetchConnections('rejected')
      ]);

      setConnections({
        pending,
        accepted,
        rejected
      });
      lastLoadedAtRef.current = Date.now();
    } catch (error) {
      console.error('Error loading connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  // Removed auto-refresh on visibility change to prevent unnecessary API calls
  // Data will only refresh when explicitly needed or cache expires

  const handleConnectionAction = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingRequest(requestId);
    
    try {
      const res = await fetch(`/api/connections/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Connection request ${action}ed successfully!`);
        await loadAllConnections();
      } else {
        toast.error(data.message || `Failed to ${action} connection request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing connection:`, error);
      toast.error(`Failed to ${action} connection request`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const startConversation = async (seekerId: string, seekerName: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seekerId: seekerId,
          guideId: session?.user?.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = `/dashboard/chat?conversation=${data.conversation._id}`;
      } else {
        toast.error(`Failed to start conversation with ${seekerName}`);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(`Failed to start conversation with ${seekerName}`);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadAllConnections(true);
    }
  }, [session?.user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ConnectionCard = ({ connection }: { connection: ConnectionWithProfile }) => {
    const seekerProfile = connection.seekerProfile;
    const avatar = seekerProfile ? generateAvatar(seekerProfile.alias) : generateAvatar(connection.fromUser.alias);
    const avatarProps = getAvatarProps(avatar);
    const isProcessing = processingRequest === connection._id;

    return (
      <Card className="group hover:shadow-2xl hover:ring-2 hover:ring-emerald-200 dark:hover:ring-emerald-700 hover:scale-[1.02] transition-all duration-300 border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarProps.src} alt={avatarProps.alt} />
                <AvatarFallback className={avatarProps.className}>
                  {(seekerProfile?.alias || connection.fromUser.alias || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {seekerProfile?.alias || connection.fromUser.alias}
                </h3>
                <Badge variant="outline" className={`${getStatusColor(connection.status)} text-xs`}>
                  {getStatusIcon(connection.status)}
                  <span className="ml-1 capitalize">{connection.status}</span>
                </Badge>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              {connection.status === 'pending' ? (
                <div>Sent: {formatDate(connection.createdAt)}</div>
              ) : (
                <div>Updated: {formatDate(connection.updatedAt)}</div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {seekerProfile && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Stethoscope className="w-4 h-4" />
                <span>{seekerProfile.condition}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{seekerProfile.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{seekerProfile.gender}, {seekerProfile.age}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Diagnosed {seekerProfile.diagnosisDate}</span>
              </div>
            </div>
          )}

          {connection.message && (
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-800 mb-1">Message from seeker:</p>
                  <p className="text-sm text-blue-700">"{connection.message}"</p>
                </div>
              </div>
            </div>
          )}

          {seekerProfile?.symptoms && seekerProfile.symptoms.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Current symptoms:</h4>
              <div className="flex flex-wrap gap-1">
                {seekerProfile.symptoms.slice(0, 4).map((symptom, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
                {seekerProfile.symptoms.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{seekerProfile.symptoms.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {seekerProfile?.supportType && seekerProfile.supportType.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Looking for:</h4>
              <div className="flex flex-wrap gap-1">
                {seekerProfile.supportType.map((type, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            {connection.status === 'pending' && (
              <div className="flex space-x-2 w-full">
                <Button
                  onClick={() => handleConnectionAction(connection._id, 'accept')}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  size="sm"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleConnectionAction(connection._id, 'reject')}
                  disabled={isProcessing}
                  variant="outline"
                  className="border-red-200 hover:bg-red-50 text-red-600 flex-1"
                  size="sm"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <>
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Decline
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {connection.status === 'accepted' && (
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Heart className="w-4 h-4" />
                  <span>Active Connection</span>
                </div>
                <Button
                  onClick={() => startConversation(connection.fromUser._id, seekerProfile?.alias || connection.fromUser.alias)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            )}

            {connection.status === 'rejected' && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 w-full justify-center">
                <XCircle className="w-4 h-4" />
                <span>Connection Declined</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const PaginatedConnections = ({ connections, type }: { connections: ConnectionWithProfile[], type: keyof typeof currentPage }) => {
    const startIndex = (currentPage[type] - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedConnections = connections.slice(startIndex, endIndex);
    const totalPages = Math.ceil(connections.length / ITEMS_PER_PAGE);

    return (
      <div className="space-y-6">
        {paginatedConnections.length === 0 ? (
          <Card className="text-center py-16 bg-white/90 dark:bg-gray-800/90 border-0 shadow-lg dark:shadow-xl backdrop-blur-sm">
            <CardContent>
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/50 dark:to-blue-900/50 flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                No {type} connection requests
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                {type === 'pending' && "No pending requests from seekers at the moment. Your expertise will be valued when seekers reach out!"}
                {type === 'accepted' && "No accepted connections yet. Accept some requests to start making a meaningful impact in someone's journey!"}
                {type === 'rejected' && "No declined requests. You're maintaining high standards for meaningful connections!"}
              </p>
              
              {type === 'pending' && (
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.href = '/dashboard/matching'}
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Explore Community
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {paginatedConnections.map((connection) => (
                <ConnectionCard key={connection._id} connection={connection} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => ({ ...prev, [type]: Math.max(1, prev[type] - 1) }))}
                  disabled={currentPage[type] === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage[type]} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => ({ ...prev, [type]: Math.min(totalPages, prev[type] + 1) }))}
                  disabled={currentPage[type] === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="space-y-2">
            <div className="h-9 w-72 bg-emerald-200/40 dark:bg-emerald-700/40 rounded-md animate-pulse" />
            <div className="h-5 w-96 bg-emerald-100/40 dark:bg-emerald-800/40 rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0,1,2].map((i) => (
              <Card key={i} className="bg-white/70 border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-full h-12 w-12 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-12 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0,1,2,3].map((i) => (
              <Card key={i} className="border-0 shadow-md bg-white/90">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gray-100 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton lines={3} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Breadcrumb */}
        <div className="flex justify-start">
          <DashboardBreadcrumb />
        </div>
        
        {/*  Header */}
        <div className="relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 dark:from-emerald-400/20 dark:to-blue-400/20 rounded-3xl -z-10 blur-3xl"></div>
          
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">

              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                  <Award className="w-4 h-4" />
                  <span>Guide Dashboard</span>
                </div>
                <ModeToggle />
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse delay-200"></div>
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400">
                Connection Requests
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Manage incoming connection requests from seekers looking for your guidance and expertise
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mt-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>Guide Network</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Help Seekers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span>Share Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800/30 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-lg group-hover:shadow-amber-200 dark:group-hover:shadow-amber-900/50 transition-all duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-amber-800 dark:text-amber-200">{connections.pending.length}</h3>
                    <p className="text-amber-600 dark:text-amber-400 font-medium">Pending Requests</p>
                  </div>
                </div>
                <div className="text-amber-300 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Clock className="w-12 h-12" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800/30 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg group-hover:shadow-emerald-200 dark:group-hover:shadow-emerald-900/50 transition-all duration-300">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">{connections.accepted.length}</h3>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">Active Mentorships</p>
                  </div>
                </div>
                <div className="text-emerald-300 opacity-20 group-hover:opacity-40 transition-opacity">
                  <CheckCircle className="w-12 h-12" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border-rose-200 dark:border-rose-800/30 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl shadow-lg group-hover:shadow-rose-200 dark:group-hover:shadow-rose-900/50 transition-all duration-300">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-rose-800 dark:text-rose-200">{connections.rejected.length}</h3>
                    <p className="text-rose-600 dark:text-rose-400 font-medium">Declined</p>
                  </div>
                </div>
                <div className="text-rose-300 opacity-20 group-hover:opacity-40 transition-opacity">
                  <XCircle className="w-12 h-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/*  Connections Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-emerald-100 dark:border-emerald-800/30 shadow-xl p-2 h-auto min-h-[60px]">
            <TabsTrigger 
              value="pending" 
              className="group flex items-center justify-center space-x-2 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-200/50 dark:data-[state=active]:shadow-amber-900/30 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-600 dark:text-gray-300 data-[state=active]:transform data-[state=active]:scale-[1.02] relative z-10"
            >
              <Clock className="w-4 h-4 group-data-[state=active]:animate-pulse" />
              <span className="whitespace-nowrap">Pending ({connections.pending.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="accepted" 
              className="group flex items-center justify-center space-x-2 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-200/50 dark:data-[state=active]:shadow-emerald-900/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-600 dark:text-gray-300 data-[state=active]:transform data-[state=active]:scale-[1.02] relative z-10"
            >
              <CheckCircle className="w-4 h-4 group-data-[state=active]:animate-pulse" />
              <span className="whitespace-nowrap">Accepted ({connections.accepted.length})</span>
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              className="group flex items-center justify-center space-x-2 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-200/50 dark:data-[state=active]:shadow-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-300 data-[state=active]:transform data-[state=active]:scale-[1.02] relative z-10"
            >
              <XCircle className="w-4 h-4 group-data-[state=active]:animate-pulse" />
              <span className="whitespace-nowrap">Rejected ({connections.rejected.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="animate-in fade-in-50 duration-300">
            <PaginatedConnections connections={connections.pending} type="pending" />
          </TabsContent>

          <TabsContent value="accepted" className="animate-in fade-in-50 duration-300">
            <PaginatedConnections connections={connections.accepted} type="accepted" />
          </TabsContent>

          <TabsContent value="rejected" className="animate-in fade-in-50 duration-300">
            <PaginatedConnections connections={connections.rejected} type="rejected" />
          </TabsContent>
        </Tabs>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}
