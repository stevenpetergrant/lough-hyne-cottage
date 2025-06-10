import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Heart, MapPin, Upload, Star, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatDateTime } from "@/lib/dateUtils";

export default function GuestExperience() {
  const [qrCode, setQrCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [guestInfo, setGuestInfo] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [experienceData, setExperienceData] = useState({
    guestName: "",
    experienceTitle: "",
    experienceDescription: "",
    recommendation: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setQrCode(code);
      validateQrCode(code);
    }
  }, []);

  const validateQrCode = async (code: string) => {
    try {
      const response = await apiRequest("POST", "/api/validate-guest-qr", { code });
      const data = await response.json();
      if (data.valid) {
        setIsValidated(true);
        setGuestInfo(data.guestInfo);
      } else {
        toast({
          title: "Invalid Code",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: publicExperiences } = useQuery({
    queryKey: ["/api/guest-experiences/public"],
    enabled: isValidated,
  });

  const uploadExperienceMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/guest-experiences", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload experience");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience Shared!",
        description: "Thank you for sharing your experience. It will be reviewed and published soon.",
      });
      setExperienceData({
        guestName: "",
        experienceTitle: "",
        experienceDescription: "",
        recommendation: "",
      });
      setSelectedFiles([]);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to share experience. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      validateQrCode(qrCode.trim());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files].slice(0, 6)); // Max 6 photos
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitExperience = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!experienceData.guestName || !experienceData.experienceTitle || !experienceData.experienceDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, title and description.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('qrCodeId', qrCode);
    formData.append('guestName', experienceData.guestName);
    formData.append('stayDate', guestInfo?.checkInDate || '');
    formData.append('experienceTitle', experienceData.experienceTitle);
    formData.append('experienceDescription', experienceData.experienceDescription);
    formData.append('recommendation', experienceData.recommendation);
    
    selectedFiles.forEach((file, index) => {
      formData.append(`photos`, file);
    });

    uploadExperienceMutation.mutate(formData);
  };

  if (!isValidated) {
    return (
      <div className="min-h-screen bg-natural-white">
        <SEOHead
          title="Share Your Experience - Lough Hyne Cottage"
          description="Share your memories and recommendations from your stay at Lough Hyne Cottage"
        />
        <Navigation />
        
        <div className="py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Camera className="h-16 w-16 text-forest mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
                Share Your Experience
              </h1>
              <p className="text-lg text-gray-600">
                We'd love to hear about your stay and see your beautiful photos!
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enter Your Guest Code</CardTitle>
                <CardDescription>
                  Use the QR code provided during your stay or enter the code manually
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleQrSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="qrCode">Guest Code</Label>
                    <Input
                      id="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Enter your guest code (e.g., LHC-GUEST-12345)"
                      className="text-center text-lg"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-forest hover:bg-forest/80">
                    Access Experience Sharing
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Share Your Experience - Lough Hyne Cottage"
        description="Share your memories and recommendations from your stay at Lough Hyne Cottage"
      />
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-sage" />
              <h1 className="text-4xl md:text-5xl font-bold text-forest">
                Welcome Back, {guestInfo?.guestName}!
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Share your magical moments from Lough Hyne Cottage
            </p>
          </div>

          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="share" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Share Experience</span>
              </TabsTrigger>
              <TabsTrigger value="explore" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Explore Others</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="share">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-6 w-6 text-forest" />
                    <span>Share Your Experience</span>
                  </CardTitle>
                  <CardDescription>
                    Help future guests discover the magic of Lough Hyne Cottage through your eyes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitExperience} className="space-y-6">
                    <div>
                      <Label htmlFor="guestName">Your Name *</Label>
                      <Input
                        id="guestName"
                        value={experienceData.guestName}
                        onChange={(e) => setExperienceData(prev => ({ ...prev, guestName: e.target.value }))}
                        placeholder="Enter your name or nickname"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="experienceTitle">Experience Title *</Label>
                      <Input
                        id="experienceTitle"
                        value={experienceData.experienceTitle}
                        onChange={(e) => setExperienceData(prev => ({ ...prev, experienceTitle: e.target.value }))}
                        placeholder="e.g., 'Sunrise Kayaking on Lough Hyne' or 'Perfect Evening Sauna Session'"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="experienceDescription">Tell Us About It *</Label>
                      <Textarea
                        id="experienceDescription"
                        value={experienceData.experienceDescription}
                        onChange={(e) => setExperienceData(prev => ({ ...prev, experienceDescription: e.target.value }))}
                        placeholder="Describe your experience... What made it special? What did you discover? How did it make you feel?"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="recommendation">Your Recommendation</Label>
                      <Textarea
                        id="recommendation"
                        value={experienceData.recommendation}
                        onChange={(e) => setExperienceData(prev => ({ ...prev, recommendation: e.target.value }))}
                        placeholder="Any tips or recommendations for future guests? Best times to visit certain spots, hidden gems, local secrets..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Share Your Photos (Optional)</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-forest transition-colors"
                        >
                          <Camera className="h-5 w-5 mr-2 text-gray-500" />
                          <span>Choose Photos (Max 6)</span>
                        </label>
                      </div>
                      
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0"
                                onClick={() => removeFile(index)}
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={uploadExperienceMutation.isPending}
                      className="w-full bg-forest hover:bg-forest/80 py-3"
                    >
                      {uploadExperienceMutation.isPending ? "Sharing Experience..." : "Share My Experience"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="explore">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-forest mb-2">
                    Experiences from Fellow Guests
                  </h2>
                  <p className="text-gray-600">
                    Discover the magic through other visitors' eyes
                  </p>
                </div>

                {publicExperiences && Array.isArray(publicExperiences) && publicExperiences.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {publicExperiences.map((experience: any) => (
                      <Card key={experience.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-forest">{experience.experienceTitle}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            </div>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{experience.guestName}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(experience.stayDate)}</span>
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-700">{experience.experienceDescription}</p>
                          
                          {experience.recommendation && (
                            <Alert>
                              <MapPin className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Guest Tip:</strong> {experience.recommendation}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {experience.photos && experience.photos.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {experience.photos.slice(0, 4).map((photo: string, index: number) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Experience photo ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Be the First to Share!
                      </h3>
                      <p className="text-gray-500">
                        No experiences have been shared yet. Be the first to inspire future guests!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}