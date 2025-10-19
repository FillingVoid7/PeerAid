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
  Clock,
  Shield,
  Droplets,
  Stethoscope,
  Phone,
  Mail,
  UserCheck,
  X
} from 'lucide-react';
import { getAvatarProps } from '@/lib/utilities/avatarGenerator';

interface ViewDetailsProps {
  selectedGuide: any;
  sentRequestIds: Set<string>;
  receivedRequestIds: Set<string>;
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
  sendingId,
  onClose,
  onConnectionClick,
  getConnectionStrengthColor,
  getConnectionStrengthIcon
}: ViewDetailsProps) {
  if (!selectedGuide) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white shadow-2xl border border-gray-200  rounded-lg">
        <CardHeader className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src={getAvatarProps(selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide", 64).src} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl">
                  {(selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl text-gray-900">
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
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6 bg-white">
          {/* Detailed Match Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Match Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Condition Match</span>
                  <span className="font-medium text-gray-900">{selectedGuide.breakdown.conditionMatch}%</span>
                </div>
                <Progress value={selectedGuide.breakdown.conditionMatch} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Symptom Match</span>
                  <span className="font-medium text-gray-900">{selectedGuide.breakdown.symptomMatch}%</span>
                </div>
                <Progress value={selectedGuide.breakdown.symptomMatch} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Demographics</span>
                  <span className="font-medium text-gray-900">{selectedGuide.breakdown.demographicMatch}%</span>
                </div>
                <Progress value={selectedGuide.breakdown.demographicMatch} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Treatments</span>
                  <span className="font-medium text-gray-900">{selectedGuide.breakdown.treatmentMatch}%</span>
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
                <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-medium text-gray-800">Condition</div>
                    <div className="text-sm text-gray-600">{selectedGuide.guideProfile.conditionName}</div>
                  </div>
                </div>
              )}
              {selectedGuide.guideProfile?.location && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-800">Location</div>
                    <div className="text-sm text-gray-600">{selectedGuide.guideProfile.location}</div>
                  </div>
                </div>
              )}
              {selectedGuide.guideProfile?.age && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-100">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-gray-800">Age</div>
                    <div className="text-sm text-gray-600">{selectedGuide.guideProfile.age} years old</div>
                  </div>
                </div>
              )}
              {selectedGuide.guideProfile?.bloodType && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-100">
                  <Droplets className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-800">Blood Type</div>
                    <div className="text-sm text-gray-600">{selectedGuide.guideProfile.bloodType}</div>
                  </div>
                </div>
              )}
              {selectedGuide.guideProfile?.gender && (
                <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <Users className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="font-medium text-gray-800">Gender</div>
                    <div className="text-sm text-gray-600 capitalize">{selectedGuide.guideProfile.gender}</div>
                  </div>
                </div>
              )}
              {selectedGuide.guideProfile?.verificationMethod && (
                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
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
                  <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-orange-500" />
                      <span className="font-medium text-gray-800">{symptom.name_of_symptoms}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                        {symptom.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
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
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
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
                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-800">Email</div>
                      <div className="text-sm text-gray-600">{selectedGuide.guideProfile.contactInfo.contact_email}</div>
                    </div>
                  </div>
                )}
                {selectedGuide.guideProfile.contactInfo.contact_phone && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-100">
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
                {selectedGuide.sharedSymptoms.map((symptom: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
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
                {selectedGuide.effectiveTreatments.map((treatment: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                    {treatment}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Match Explanation */}
          {selectedGuide.explanation && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Why This Match?</h3>
              <p className="text-gray-700">{selectedGuide.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            <Button
              disabled={(() => {
                const guideUserId = selectedGuide.guideProfile.userId?._id;
                return !guideUserId || sendingId === String(guideUserId);
              })()}
              onClick={() => {
                const guideUserId = selectedGuide.guideProfile.userId?._id;
                const guideName = selectedGuide.guideProfile.userId?.alias || selectedGuide.guideProfile.alias || "Guide";
                if (guideUserId) {
                  onConnectionClick(String(guideUserId), guideName);
                }
              }}
              className={`flex-1 ${
                (() => {
                  const guideUserId = selectedGuide.guideProfile.userId?._id;
                  const hasRequestSent = sentRequestIds.has(String(guideUserId));
                  const hasRequestReceived = receivedRequestIds.has(String(guideUserId));
                  
                  if (hasRequestSent) {
                    return "bg-yellow-100 text-yellow-800 border-yellow-200 cursor-not-allowed opacity-75 hover:bg-yellow-100 hover:text-yellow-800";
                  } else if (hasRequestReceived) {
                    return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
                  }
                  return "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white";
                })()
              }`}
            >
              {(() => {
                const guideUserId = selectedGuide.guideProfile.userId?._id;
                const hasRequestSent = sentRequestIds.has(String(guideUserId));
                const hasRequestReceived = receivedRequestIds.has(String(guideUserId));
                const isConnecting = sendingId === String(guideUserId);
                
                if (hasRequestSent) {
                  return (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Connection Requested
                    </>
                  );
                } else if (hasRequestReceived) {
                  return (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Accept Connection
                    </>
                  );
                } else if (isConnecting) {
                  return (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  );
                } else {
                  return (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Connect Now
                    </>
                  );
                }
              })()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}