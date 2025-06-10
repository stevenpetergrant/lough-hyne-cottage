import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User, Calendar, Star, ImageIcon, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface GuestExperience {
  id: number;
  guestName: string;
  experienceTitle: string;
  experienceDescription: string;
  recommendation?: string;
  stayDate: string;
  photos: string[];
  isApproved: boolean;
  isPublic: boolean;
  qrCodeId: string;
  createdAt: string;
}

export default function GuestStoryApprovalManager() {
  const { toast } = useToast();
  
  const { data: pendingExperiences = [], isLoading: pendingLoading } = useQuery<GuestExperience[]>({
    queryKey: ["/api/guest-experiences/pending"],
  });

  const { data: approvedExperiences = [], isLoading: approvedLoading } = useQuery<GuestExperience[]>({
    queryKey: ["/api/guest-experiences/approved"],
  });

  const { data: rejectedExperiences = [], isLoading: rejectedLoading } = useQuery<GuestExperience[]>({
    queryKey: ["/api/guest-experiences/rejected"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/guest-experiences/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-experiences/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-experiences/approved"] });
      toast({
        title: "Story Approved",
        description: "The guest story has been approved and is now public.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/guest-experiences/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-experiences/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-experiences/rejected"] });
      toast({
        title: "Story Rejected",
        description: "The guest story has been rejected and hidden from public view.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: number; isPublic: boolean }) => {
      return await apiRequest("POST", `/api/guest-experiences/${id}/toggle-public`, { isPublic });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/guest-experiences/approved"] });
      toast({
        title: "Visibility Updated",
        description: "Story visibility has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const renderExperienceCard = (experience: GuestExperience, showActions = false) => (
    <Card key={experience.id} className="mb-6">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{experience.guestName}</span>
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(experience.stayDate), 'MMM dd, yyyy')}
              </Badge>
            </div>
            <CardTitle className="text-xl">{experience.experienceTitle}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Submitted {format(new Date(experience.createdAt), 'MMM dd, yyyy - HH:mm')}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {experience.isApproved && (
              <Badge variant={experience.isPublic ? "default" : "secondary"}>
                {experience.isPublic ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Photos */}
        {experience.photos && experience.photos.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Photos ({experience.photos.length})</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {experience.photos.slice(0, 4).map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo.startsWith('http') ? photo : `/uploads/${photo}`}
                  alt={`Guest photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ))}
              {experience.photos.length > 4 && (
                <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                  +{experience.photos.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Experience Description */}
        <div>
          <h4 className="font-medium mb-2">Experience Description</h4>
          <p className="text-gray-700 leading-relaxed">{experience.experienceDescription}</p>
        </div>
        
        {/* Recommendation */}
        {experience.recommendation && (
          <div className="bg-sage/5 p-4 rounded-lg border-l-4 border-sage">
            <div className="flex items-start space-x-2">
              <Star className="h-4 w-4 text-sage mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-sage mb-1">Guest Recommendation</p>
                <p className="text-sm text-gray-700 italic">"{experience.recommendation}"</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={() => approveMutation.mutate(experience.id)}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
            <Button
              onClick={() => rejectMutation.mutate(experience.id)}
              disabled={rejectMutation.isPending}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
        
        {/* Toggle Public Visibility for Approved Stories */}
        {experience.isApproved && (
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={() => togglePublicMutation.mutate({ 
                id: experience.id, 
                isPublic: !experience.isPublic 
              })}
              disabled={togglePublicMutation.isPending}
              variant="outline"
            >
              {experience.isPublic ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide from Public
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Make Public
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Guest Story Management</h2>
        <p className="text-gray-600">Review and approve guest experiences before they appear publicly</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-500" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingExperiences.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Approved Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedExperiences.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-blue-500" />
              Public Stories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {approvedExperiences.filter(exp => exp.isPublic).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending ({pendingExperiences.length})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Approved ({approvedExperiences.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <XCircle className="h-4 w-4" />
            <span>Rejected ({rejectedExperiences.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {pendingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingExperiences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pending Stories</h3>
                <p className="text-gray-500">All guest stories have been reviewed.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pendingExperiences.map((experience) => renderExperienceCard(experience, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {approvedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : approvedExperiences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Approved Stories</h3>
                <p className="text-gray-500">Approved guest stories will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {approvedExperiences.map((experience) => renderExperienceCard(experience))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          {rejectedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rejectedExperiences.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Rejected Stories</h3>
                <p className="text-gray-500">Rejected guest stories will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {rejectedExperiences.map((experience) => renderExperienceCard(experience))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}