import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, QrCode, Smartphone, Heart } from "lucide-react";
import { Link } from "wouter";

export default function GuestExperienceDemo() {
  return (
    <div className="min-h-screen bg-natural-white">
      <SEOHead
        title="Interactive Guest Experience Demo - Lough Hyne Cottage"
        description="See how guests can share their experiences through our interactive QR code system"
      />
      <Navigation />
      
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Camera className="h-16 w-16 text-forest mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-forest mb-4">
              Interactive Guest Experience System
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform your guests into storytellers! This QR code system lets visitors share photos, 
              stories, and recommendations seamlessly, creating a community-driven experience library.
            </p>
          </div>

          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-forest mb-6 text-center">Try the Guest Experience System</h2>
              <Card className="border-sage border-2">
                <CardHeader className="text-center">
                  <CardTitle className="text-forest">Demo QR Code Portal</CardTitle>
                  <CardDescription>
                    Use the demo QR code below to experience what your guests would see
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="inline-block p-6 bg-white rounded-lg shadow-lg border-2 border-dashed border-sage">
                      <QrCode className="h-32 w-32 text-forest mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Demo QR Code</p>
                      <code className="bg-sage/10 px-3 py-1 rounded text-forest font-mono">
                        LHC-GUEST-DEMO
                      </code>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link href="/guest-experience?code=LHC-GUEST-DEMO">
                      <Button className="bg-forest hover:bg-forest/80 text-white px-8 py-3">
                        <Smartphone className="h-4 w-4 mr-2" />
                        Experience Guest Portal
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-2">
                      Click to see what guests experience when they scan the QR code
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-forest mb-6 text-center">How It Works</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-forest">1</span>
                    </div>
                    <CardTitle className="text-lg">Guest Checks In</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Generate a unique QR code for each guest booking through the admin dashboard
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <QrCode className="h-8 w-8 text-forest" />
                    </div>
                    <CardTitle className="text-lg">QR Code Placed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Place the QR code in welcome materials, the cottage, or send it digitally
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-forest" />
                    </div>
                    <CardTitle className="text-lg">Guests Share</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Guests scan the code to upload photos, share stories, and leave recommendations
                    </p>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-forest" />
                    </div>
                    <CardTitle className="text-lg">Community Builds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Future guests discover authentic experiences and hidden gems from real visitors
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-sage border-2">
              <CardContent className="text-center py-8">
                <Camera className="h-16 w-16 text-sage mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-forest mb-2">
                  Ready to Start Building Your Guest Community?
                </h3>
                <p className="text-gray-600 mb-4">
                  Every guest becomes a storyteller, every stay becomes part of your story.
                </p>
                <Link href="/guest-experience?code=LHC-GUEST-DEMO">
                  <Button className="bg-forest hover:bg-forest/80">
                    Try the Guest Experience Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}