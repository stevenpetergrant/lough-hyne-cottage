import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, CheckCircle, Mail, ArrowRight } from "lucide-react";

export default function SaunaAddonInfo() {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Seamless Sauna Add-on Booking System
        </CardTitle>
        <CardDescription>
          How cabin guests with sauna add-ons can effortlessly book their included sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Workflow Overview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Complete Workflow
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">1</div>
              <h4 className="font-medium">Cabin Booking</h4>
              <p className="text-sm text-gray-600">Guest books cabin with sauna add-on during checkout</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">2</div>
              <h4 className="font-medium">Auto-Setup</h4>
              <p className="text-sm text-gray-600">System creates sauna availability for their stay dates</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">3</div>
              <h4 className="font-medium">Easy Booking</h4>
              <p className="text-sm text-gray-600">Guest clicks email link to select preferred time slot</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Technical Implementation */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Technical Implementation</h3>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Backend Features */}
            <div>
              <h4 className="font-medium mb-3 text-green-700">Backend Automation</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Database schema updated with addOns tracking and sauna booking linking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Stripe webhook automatically detects sauna add-on purchases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Auto-creates 7pm & 8pm sauna slots for each night of cabin stay</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>API endpoints for availability checking and no-cost booking</span>
                </li>
              </ul>
            </div>

            {/* Frontend Features */}
            <div>
              <h4 className="font-medium mb-3 text-blue-700">User Experience</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Dedicated sauna booking page at /sauna-addon?booking=ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Validates booking ID and verifies sauna add-on inclusion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Shows available time slots during their stay period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>One-click booking with instant confirmation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* API Endpoints */}
        <div>
          <h3 className="font-semibold text-lg mb-4">API Endpoints</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">GET</Badge>
                <code className="text-sm">/api/cabin-sauna-availability/:bookingId</code>
              </div>
              <p className="text-sm text-gray-600">Returns available sauna slots for a cabin booking with add-on</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">POST</Badge>
                <code className="text-sm">/api/book-included-sauna</code>
              </div>
              <p className="text-sm text-gray-600">Books a sauna session at no additional cost for cabin guests</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Usage Instructions */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Customer Instructions
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm leading-relaxed">
              After completing your cabin booking with sauna add-on, you'll receive a confirmation email containing a special link. 
              Click this link to access your personal sauna booking page where you can select your preferred session time during your stay. 
              The booking is included in your cabin reservation at no additional charge.
            </p>
          </div>
        </div>

        {/* Example Email Link */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-green-800">Example Email Link</h4>
          <code className="text-sm bg-white px-2 py-1 rounded border text-green-700">
            https://loughhynecottage.com/sauna-addon?booking=12345
          </code>
          <p className="text-xs text-green-600 mt-2">
            This secure link is unique to each booking and validates the customer's sauna add-on eligibility
          </p>
        </div>

      </CardContent>
    </Card>
  );
}