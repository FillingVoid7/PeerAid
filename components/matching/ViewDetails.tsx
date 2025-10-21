"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Droplets,
  Stethoscope,
  Phone,
  Mail,
  UserCheck,
  X,
  Star,
  TrendingUp,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { getAvatarProps } from '@/lib/utilities/avatarGenerator';

interface ViewDetailsProps {
  selectedGuide: any;
  sentRequestIds: Set<string>;
  receivedRequestIds: Set<string>;
  acceptedConnectionIds: Set<string>;
  rejectedConnectionIds: Set<string>;
  sendingId: string | null;
  onClose: () => void;
  onConnectionClick: (userId: string, userName: string) => void;
  getConnectionStrengthColor: (strength: string) => string;
  getConnectionStrengthIcon: (strength: string) => React.ReactNode;
}

export function ViewDetails({
  selectedGuide,
  sentRequestIds,
  receivedRequestIds,
  acceptedConnectionIds,
  rejectedConnectionIds,
  sendingId,
  onClose,
  onConnectionClick,
  getConnectionStrengthColor,
  getConnectionStrengthIcon
}: ViewDetailsProps) {
  if (!selectedGuide) return null;

  const guideName = selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide";
  const guideUserId = selectedGuide.guideProfile.userId?._id;
  const hasRequestSent = sentRequestIds.has(String(guideUserId));
  const hasRequestReceived = receivedRequestIds.has(String(guideUserId));
  const isConnectionAccepted = acceptedConnectionIds.has(String(guideUserId));
  const isConnectionRejected = rejectedConnectionIds.has(String(guideUserId));
  const isConnecting = sendingId === String(guideUserId);

  return (
<div className="fixed -inset-9 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-0 m-0  w-screen h-screen overflow-hidden">
      <Card className="w-full max-w-4xl max-h-[90vh]  bg-white/95 dark:bg-gray-900/95 shadow-2xl border-0 rounded-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <CardHeader className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-4 ring-white/50 dark:ring-gray-700/50 shadow-xl">
                  <AvatarImage src={getAvatarProps(guideName, 80).src} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                    {guideName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {guideName}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Medical Guide & Peer Supporter</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={`${getConnectionStrengthColor(selectedGuide.connectionStrength)} text-sm font-semibold shadow-sm`}>
                    {getConnectionStrengthIcon(selectedGuide.connectionStrength)}
                    <span className="ml-1 capitalize">{selectedGuide.connectionStrength} Match</span>
                  </Badge>
                  <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {selectedGuide.matchScore}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-10 w-10 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Match Analysis */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Compatibility Analysis</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3 p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition Match</span>
                    </div>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{selectedGuide.breakdown.conditionMatch}%</span>
                  </div>
                  <Progress value={selectedGuide.breakdown.conditionMatch} className="h-3 bg-red-100 dark:bg-red-900/30" />
                </div>

                <div className="space-y-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Symptom Match</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{selectedGuide.breakdown.symptomMatch}%</span>
                  </div>
                  <Progress value={selectedGuide.breakdown.symptomMatch} className="h-3 bg-blue-100 dark:bg-blue-900/30" />
                </div>

                <div className="space-y-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Demographics</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{selectedGuide.breakdown.demographicMatch}%</span>
                  </div>
                  <Progress value={selectedGuide.breakdown.demographicMatch} className="h-3 bg-green-100 dark:bg-green-900/30" />
                </div>

                <div className="space-y-3 p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Treatments</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{selectedGuide.breakdown.treatmentMatch}%</span>
                  </div>
                  <Progress value={selectedGuide.breakdown.treatmentMatch} className="h-3 bg-purple-100 dark:bg-purple-900/30" />
                </div>
              </div>
            </div>

            {/* Guide Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Guide Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedGuide.guideProfile?.conditionName && (
                  <div className="group p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-100 dark:border-red-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Medical Condition</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.conditionName}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGuide.guideProfile?.location && (
                  <div className="group p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Location</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.location}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGuide.guideProfile?.age && (
                  <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Calendar className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Age</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.age} years old</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGuide.guideProfile?.bloodType && (
                  <div className="group p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-100 dark:border-red-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Droplets className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Blood Type</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.bloodType}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGuide.guideProfile?.gender && (
                  <div className="group p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Gender</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedGuide.guideProfile.gender}</div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedGuide.guideProfile?.verificationMethod && (
                  <div className="group p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Verified Status</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedGuide.guideProfile.verificationMethod}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/*  Symptoms Section */}
            {selectedGuide.guideProfile?.symptoms && selectedGuide.guideProfile.symptoms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Symptoms Experience</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {selectedGuide.guideProfile.symptoms.map((symptom: any, idx: number) => (
                    <div key={idx} className="group p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-4 h-4 text-orange-500" />
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{symptom.name_of_symptoms}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 text-xs font-medium">
                            {symptom.severity}
                          </Badge>
                          <Badge variant="outline" className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-medium">
                            {symptom.frequency}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/*  Diagnosis Section */}
            {selectedGuide.guideProfile?.diagnosis && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Medical Diagnosis</h3>
                </div>
                <div className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-100 dark:border-teal-800/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                      <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Status</div>
                      <div className={`text-sm font-medium ${selectedGuide.guideProfile.diagnosis.diagnosed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedGuide.guideProfile.diagnosis.diagnosed ? 'Diagnosed' : 'Not Diagnosed'}
                      </div>
                    </div>
                    {selectedGuide.guideProfile.diagnosis.diagnosedBy && (
                      <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Diagnosed By</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.diagnosis.diagnosedBy}</div>
                      </div>
                    )}
                    {selectedGuide.guideProfile.diagnosis.certainty && (
                      <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Certainty Level</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedGuide.guideProfile.diagnosis.certainty}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {selectedGuide.guideProfile?.contactInfo && (selectedGuide.guideProfile.contactInfo.contact_email || selectedGuide.guideProfile.contactInfo.contact_phone) && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedGuide.guideProfile.contactInfo.contact_email && (
                    <div className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <Mail className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Email Address</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.contactInfo.contact_email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedGuide.guideProfile.contactInfo.contact_phone && (
                    <div className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                          <Phone className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Phone Number</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{selectedGuide.guideProfile.contactInfo.contact_phone}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/*  Shared Symptoms */}
            {selectedGuide.sharedSymptoms && selectedGuide.sharedSymptoms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shared Symptoms</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                  <div className="flex flex-wrap gap-3">
                    {selectedGuide.sharedSymptoms.map((symptom: string, idx: number) => (
                      <Badge key={idx} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/*  Effective Treatments */}
            {selectedGuide.effectiveTreatments && selectedGuide.effectiveTreatments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Effective Treatments</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="flex flex-wrap gap-3">
                    {selectedGuide.effectiveTreatments.map((treatment: string, idx: number) => (
                      <Badge key={idx} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        {treatment}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/*  Match Explanation */}
            {selectedGuide.explanation && (
              <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Why This Match?</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-11">{selectedGuide.explanation}</p>
              </div>
            )}
          </div>

          {/*  Action Buttons */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                Close
              </Button>
              <Button
                disabled={!guideUserId || isConnecting || isConnectionAccepted || isConnectionRejected}
                onClick={() => {
                  if (guideUserId) {
                    onConnectionClick(String(guideUserId), guideName);
                  }
                }}
                className={`flex-1 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isConnectionAccepted
                    ? "bg-green-500 hover:bg-green-500 text-white cursor-not-allowed opacity-75"
                    : isConnectionRejected
                    ? "bg-red-500 hover:bg-red-500 text-white cursor-not-allowed opacity-75"
                    : hasRequestSent 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white cursor-not-allowed opacity-75"
                    : hasRequestReceived
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                }`}
              >
                {isConnectionAccepted ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Connection Accepted
                  </>
                ) : isConnectionRejected ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Connection Rejected
                  </>
                ) : hasRequestSent ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Connection Requested
                  </>
                ) : hasRequestReceived ? (
                  <>
                    <UserCheck className="w-5 h-5 mr-2" />
                    Accept Connection
                  </>
                ) : isConnecting ? (
                  <>
                    <Clock className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5 mr-2" />
                    Connect Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}