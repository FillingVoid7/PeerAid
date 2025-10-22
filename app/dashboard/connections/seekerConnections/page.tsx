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
  Home,
  ArrowLeft,
  Sparkles,
  TrendingUp
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
  guideProfile?: {
    _id: string;
    userId: string;
    alias: string;
    condition: string;
    symptoms: string[];
    location: string;
    gender: string;
    age: number;
    experienceLevel: string;
    mentoringSince: string;
  };
}

const ITEMS_PER_PAGE = 6;

export default function SeekerConnectionsPage() {
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

  const fetchConnections = async (type: string) => {
    try {
      const res = await fetch(`/api/connections/${type}`);
      const data = await res.json();
      
      if (res.ok && data.requests) {
        const seekerConnections = data.requests.filter((req: ConnectionRequest) => 
          req.fromUser._id === session?.user?.id
        );

        const connectionsWithProfiles = await Promise.all(
          seekerConnections.map(async (connection: ConnectionRequest) => {
            try {
              const profileRes = await fetch(`/api/get-profile/${connection.toUser._id}`);
              const profileData = await profileRes.json();
              
              return {
                ...connection,
                guideProfile: profileData.success ? profileData.profile : null
              };
            } catch (error) {
              console.error(`Error fetching profile for ${connection.toUser._id}:`, error);
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
  const REFRESH_TTL_MS = 300000; // 5 minutes cache

  const loadAllConnections = async (force: boolean = false) => {
    if (!force) {
      const now = Date.now();
      if (now - lastLoadedAtRef.current < REFRESH_TTL_MS) {
        console.log('Using cached data, skipping API call');
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

  useEffect(() => {
    if (session?.user?.id) {
      loadAllConnections(true);
    }
  }, [session?.user?.id]);

  const startConversation = async (guideId: string, guideName: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seekerId: session?.user?.id,
          guideId: guideId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = `/dashboard/chat?conversationId=${data.conversation._id}`;
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

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
    const guideProfile = connection.guideProfile;
    const avatar = guideProfile ? generateAvatar(guideProfile.alias) : generateAvatar(connection.toUser.alias);
    const avatarProps = getAvatarProps(avatar);

    return (
      <Card className="group hover:shadow-2xl hover:ring-2 hover:ring-purple-200 dark:hover:ring-purple-700 hover:scale-[1.02] transition-all duration-300 border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarProps.src} alt={avatarProps.alt} />
                <AvatarFallback className={avatarProps.className}>
                  {(guideProfile?.alias || connection.toUser.alias || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {guideProfile?.alias || connection.toUser.alias}
                </h3>
                <Badge variant="outline" className={`${getStatusColor(connection.status)} text-xs`}>
                  {getStatusIcon(connection.status)}
                  <span className="ml-1 capitalize">{connection.status}</span>
                </Badge>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400">
              {connection.status === 'pending' ? (
                <div>{formatDate(connection.createdAt)}</div>
              ) : (
                <div>{formatDate(connection.updatedAt)}</div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {guideProfile && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Stethoscope className="w-4 h-4" />
                <span>{guideProfile.condition}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>{guideProfile.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>{guideProfile.gender}, {guideProfile.age}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Since {guideProfile.mentoringSince}</span>
              </div>
            </div>
          )}

          {connection.message && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{connection.message}"</p>
            </div>
          )}

          {guideProfile?.symptoms && guideProfile.symptoms.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience with symptoms:</h4>
              <div className="flex flex-wrap gap-1">
                {guideProfile.symptoms.slice(0, 4).map((symptom, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
                {guideProfile.symptoms.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{guideProfile.symptoms.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Heart className="w-4 h-4" />
              <span>{guideProfile?.experienceLevel || 'Experience level not specified'}</span>
            </div>
            
            {connection.status === 'accepted' && (
              <Button
                onClick={() => startConversation(connection.toUser._id, guideProfile?.alias || connection.toUser.alias)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
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
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 flex items-center justify-center shadow-lg">
                <Users className="w-10 h-10 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                No {type} connections
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                {type === 'pending' && "You haven't sent any connection requests yet. Start exploring guides to begin your wellness journey!"}
                {type === 'accepted' && "No accepted connections yet. Keep networking and building meaningful relationships!"}
                {type === 'rejected' && "No rejected connections. Stay positive and keep connecting!"}
              </p>
              
              {type === 'pending' && (
                <div className="mt-6">
                  <Button 
                    onClick={() => window.location.href = '/dashboard/matching'}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Find Guides
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
            <div className="h-9 w-56 bg-purple-200/40 dark:bg-purple-700/40 rounded-md animate-pulse" />
            <div className="h-5 w-80 bg-purple-100/40 dark:bg-purple-800/40 rounded-md animate-pulse" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-400/20 dark:to-blue-400/20 rounded-3xl -z-10 blur-3xl"></div>
          
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl">

            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse delay-200"></div>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-blue-400 dark:to-emerald-400">
                My Connections
              </h1>              
            </div>
          </div>
        </div>

        {/*  Connections Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-purple-100 dark:border-purple-800/30 shadow-xl p-2 h-auto min-h-[60px]">
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
