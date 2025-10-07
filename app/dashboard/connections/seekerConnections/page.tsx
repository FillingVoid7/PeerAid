"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User
} from "lucide-react";
import { generateAvatar, getAvatarProps } from "@/lib/utilities/avatarGenerator";
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

        // Fetch guide profiles for each connection
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
  const REFRESH_TTL_MS = 30000; // 30 seconds

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

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && session?.user?.id) {
        loadAllConnections(false);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadAllConnections(true);
    }
  }, [session?.user?.id]);

  const startConversation = (guideId: string, guideName: string) => {
    // TODO: Implement chat functionality
    toast.info(`Starting conversation with ${guideName}...`);
    // This would typically navigate to a chat page or open a chat modal
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ConnectionCard = ({ connection }: { connection: ConnectionWithProfile }) => {
    const guideProfile = connection.guideProfile;
    const avatar = guideProfile ? generateAvatar(guideProfile.alias) : generateAvatar(connection.toUser.alias);
    const avatarProps = getAvatarProps(avatar);

    return (
      <Card className="group hover:shadow-lg hover:ring-1 hover:ring-purple-200 transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm">
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
                <h3 className="font-semibold text-gray-900">
                  {guideProfile?.alias || connection.toUser.alias}
                </h3>
                <Badge variant="outline" className={`${getStatusColor(connection.status)} text-xs`}>
                  {getStatusIcon(connection.status)}
                  <span className="ml-1 capitalize">{connection.status}</span>
                </Badge>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>Sent: {formatDate(connection.createdAt)}</div>
              {connection.status !== 'pending' && (
                <div>Updated: {formatDate(connection.updatedAt)}</div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {guideProfile && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Stethoscope className="w-4 h-4" />
                <span>{guideProfile.condition}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{guideProfile.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{guideProfile.gender}, {guideProfile.age}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Since {guideProfile.mentoringSince}</span>
              </div>
            </div>
          )}

          {connection.message && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700 italic">"{connection.message}"</p>
            </div>
          )}

          {guideProfile?.symptoms && guideProfile.symptoms.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Experience with symptoms:</h4>
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
          <Card className="text-center py-12 bg-white/80 border-0 shadow-sm">
            <CardContent>
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No {type} connections
              </h3>
              <p className="text-gray-500">
                {type === 'pending' && "You haven't sent any connection requests yet."}
                {type === 'accepted' && "No accepted connections yet. Keep networking!"}
                {type === 'rejected' && "No rejected connections."}
              </p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="space-y-2">
            <div className="h-9 w-56 bg-purple-200/40 rounded-md animate-pulse" />
            <div className="h-5 w-80 bg-purple-100/40 rounded-md animate-pulse" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              My Connections
            </h1>
            <p className="text-lg text-gray-600">
              Manage your guide connections and track your networking journey
            </p>
          </div>
          {/* refresh button removed per requirements */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-yellow-800">{connections.pending.length}</h3>
                  <p className="text-yellow-600">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-800">{connections.accepted.length}</h3>
                  <p className="text-green-600">Active Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-800">{connections.rejected.length}</h3>
                  <p className="text-red-600">Declined</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white/60 backdrop-blur border border-purple-100">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Pending ({connections.pending.length})</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Accepted ({connections.accepted.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Rejected ({connections.rejected.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PaginatedConnections connections={connections.pending} type="pending" />
          </TabsContent>

          <TabsContent value="accepted">
            <PaginatedConnections connections={connections.accepted} type="accepted" />
          </TabsContent>

          <TabsContent value="rejected">
            <PaginatedConnections connections={connections.rejected} type="rejected" />
          </TabsContent>
        </Tabs>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </div>
  );
}
