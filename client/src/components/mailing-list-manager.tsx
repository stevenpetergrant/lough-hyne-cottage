import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Users, Send, Calendar, Plus, Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  experienceType: string;
  subscriptionSource: string;
  subscribedAt: string;
  lastEmailSent?: string;
}

interface NotificationData {
  date: string;
  availableSlots: number;
  description?: string;
}

export default function MailingListManager() {
  const { toast } = useToast();
  const [selectedExperience, setSelectedExperience] = useState("yoga");
  const [notificationForm, setNotificationForm] = useState({
    date: "",
    availableSlots: 20,
    description: ""
  });
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [manualEntries, setManualEntries] = useState([
    { email: "", firstName: "", lastName: "" }
  ]);

  const { data: subscribers = [], refetch: refetchSubscribers } = useQuery<Subscriber[]>({
    queryKey: ['/api/admin/mailing-list', selectedExperience],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/mailing-list?experienceType=${selectedExperience}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }
      return response.json();
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: NotificationData) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch("/api/admin/notify-yoga-date", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to send notifications');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Notifications Sent!",
        description: `Email sent to ${data.emailsSent} subscribers about the new yoga retreat date.`,
      });
      setNotificationForm({ date: "", availableSlots: 20, description: "" });
      refetchSubscribers();
    },
    onError: (error: Error) => {
      toast({
        title: "Notification Failed",
        description: error.message || "Failed to send notifications",
        variant: "destructive",
      });
    }
  });

  const bulkUploadMutation = useMutation({
    mutationFn: async (data: { subscribers: any[], experienceType: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch("/api/admin/bulk-subscribe", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to bulk upload subscribers');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Upload Complete!",
        description: `${data.results.successful} subscribers added successfully. ${data.results.failed} failed.`,
      });
      setBulkUploadOpen(false);
      setCsvText("");
      setManualEntries([{ email: "", firstName: "", lastName: "" }]);
      refetchSubscribers();
    },
    onError: (error: Error) => {
      toast({
        title: "Bulk Upload Failed",
        description: error.message || "Failed to upload subscribers",
        variant: "destructive",
      });
    }
  });

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!notificationForm.date || !notificationForm.availableSlots) {
      toast({
        title: "Missing Information",
        description: "Please fill in the date and available slots.",
        variant: "destructive",
      });
      return;
    }

    sendNotificationMutation.mutate(notificationForm);
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const subscribers = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [email, firstName, lastName] = line.split(',').map(item => item.trim());
      if (email) {
        subscribers.push({
          email,
          firstName: firstName || "",
          lastName: lastName || ""
        });
      }
    }
    
    return subscribers;
  };

  const handleBulkUpload = (method: 'csv' | 'manual') => {
    let subscribers = [];
    
    if (method === 'csv') {
      if (!csvText.trim()) {
        toast({
          title: "No CSV Data",
          description: "Please paste CSV data before uploading.",
          variant: "destructive",
        });
        return;
      }
      subscribers = parseCsvData(csvText);
    } else {
      subscribers = manualEntries.filter(entry => entry.email.trim());
      if (subscribers.length === 0) {
        toast({
          title: "No Entries",
          description: "Please add at least one subscriber with an email address.",
          variant: "destructive",
        });
        return;
      }
    }

    bulkUploadMutation.mutate({
      subscribers,
      experienceType: selectedExperience
    });
  };

  const addManualEntry = () => {
    setManualEntries([...manualEntries, { email: "", firstName: "", lastName: "" }]);
  };

  const removeManualEntry = (index: number) => {
    setManualEntries(manualEntries.filter((_, i) => i !== index));
  };

  const updateManualEntry = (index: number, field: string, value: string) => {
    const updated = [...manualEntries];
    updated[index] = { ...updated[index], [field]: value };
    setManualEntries(updated);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Experience Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Mailing List Manager
          </CardTitle>
          <CardDescription>
            Manage subscribers and send notifications for new retreat dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {['yoga', 'bread', 'sauna', 'all'].map((type) => (
              <Button
                key={type}
                variant={selectedExperience === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedExperience(type)}
                className="capitalize"
              >
                {type} Retreats
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Send New Date Notification */}
      {selectedExperience === "yoga" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send New Date Notification
            </CardTitle>
            <CardDescription>
              Notify all yoga retreat subscribers about a new available date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Retreat Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={notificationForm.date}
                    onChange={(e) => setNotificationForm({ ...notificationForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slots">Available Slots</Label>
                  <Input
                    id="slots"
                    type="number"
                    min="1"
                    max="50"
                    value={notificationForm.availableSlots}
                    onChange={(e) => setNotificationForm({ ...notificationForm, availableSlots: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Special features or details about this retreat..."
                  value={notificationForm.description}
                  onChange={(e) => setNotificationForm({ ...notificationForm, description: e.target.value })}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Email Preview</h4>
                {notificationForm.date ? (
                  <p className="text-sm text-blue-700">
                    Subscribers will receive: <strong>"New Yoga Retreat Date: {formatDate(notificationForm.date)} - Book Now!"</strong>
                  </p>
                ) : (
                  <p className="text-sm text-blue-600">Select a date to preview the email subject</p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={sendNotificationMutation.isPending || subscribers.length === 0}
                className="w-full"
              >
                {sendNotificationMutation.isPending ? (
                  "Sending Notifications..."
                ) : (
                  `Send to ${subscribers.length} Subscribers`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Subscribers
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Bulk Upload Subscribers</DialogTitle>
                    <DialogDescription>
                      Add multiple subscribers at once using CSV data or manual entry
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="csv" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="csv" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="csvData">CSV Data</Label>
                        <Textarea
                          id="csvData"
                          placeholder="email@example.com,First Name,Last Name
jane@example.com,Jane,Doe
john@example.com,John,Smith"
                          value={csvText}
                          onChange={(e) => setCsvText(e.target.value)}
                          rows={8}
                        />
                        <p className="text-sm text-gray-500">
                          Format: email,firstName,lastName (one per line). firstName and lastName are optional.
                        </p>
                      </div>
                      
                      <Button 
                        onClick={() => handleBulkUpload('csv')}
                        disabled={bulkUploadMutation.isPending}
                        className="w-full"
                      >
                        {bulkUploadMutation.isPending ? "Uploading..." : `Upload ${parseCsvData(csvText).length} Subscribers`}
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="manual" className="space-y-4">
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {manualEntries.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <Input
                                placeholder="Email *"
                                value={entry.email}
                                onChange={(e) => updateManualEntry(index, 'email', e.target.value)}
                              />
                              <Input
                                placeholder="First Name"
                                value={entry.firstName}
                                onChange={(e) => updateManualEntry(index, 'firstName', e.target.value)}
                              />
                              <Input
                                placeholder="Last Name"
                                value={entry.lastName}
                                onChange={(e) => updateManualEntry(index, 'lastName', e.target.value)}
                              />
                            </div>
                            {manualEntries.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeManualEntry(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={addManualEntry}
                          className="flex-1"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another
                        </Button>
                        <Button 
                          onClick={() => handleBulkUpload('manual')}
                          disabled={bulkUploadMutation.isPending}
                          className="flex-1"
                        >
                          {bulkUploadMutation.isPending ? "Uploading..." : `Upload ${manualEntries.filter(e => e.email.trim()).length} Subscribers`}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
              
              <Badge variant="secondary">
                {subscribers.length} total
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No subscribers found for {selectedExperience} retreats</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {subscriber.firstName && subscriber.lastName 
                          ? `${subscriber.firstName} ${subscriber.lastName}`
                          : subscriber.email
                        }
                      </div>
                      <div className="text-sm text-gray-600">{subscriber.email}</div>
                    </div>
                    <div className="text-right text-sm">
                      <Badge variant="outline" className="capitalize">
                        {subscriber.subscriptionSource}
                      </Badge>
                      <div className="text-gray-500 mt-1">
                        Subscribed: {formatDate(subscriber.subscribedAt)}
                      </div>
                      {subscriber.lastEmailSent && (
                        <div className="text-gray-500">
                          Last email: {formatDate(subscriber.lastEmailSent)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}