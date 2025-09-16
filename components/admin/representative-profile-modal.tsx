import { useState } from "react";
import { Representative } from '../../types/representative';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Star, Truck, Calendar, Clock, Award, CheckCircle, Save, X, BarChart3, MapPin, Camera, Navigation, MessageSquare, Plus, Eye, Activity } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Representative {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  location: string;
  rating: number;
  deliveries: number;
  vehicle: string;
  avatar?: string;
  joinDate?: string;
  licenseNumber?: string;
  emergencyContact?: string;
  address?: string;
  coverageAreas?: string[];
}

interface RepresentativeProfileModalProps {
  representative: Representative | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (representative: Representative) => void;
}

export function RepresentativeProfileModal({ representative, isOpen, onClose, onSave }: RepresentativeProfileModalProps) {
  const { t } = useLanguage();
  const [editedRepresentative, setEditedRepresentative] = useState<Representative | null>(representative);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  if (!representative || !editedRepresentative) return null;

  const handleSave = () => {
    onSave(editedRepresentative);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments(prev => [...prev, newComment.trim()]);
      setNewComment("");
    }
  };

  const handleViewProfile = () => {
    // View profile logic
    console.log("Viewing profile for:", representative.name);
  };

  const handleLiveTracking = () => {
    // Live tracking logic
    console.log("Starting live tracking for:", representative.name);
  };

  const handleAssignTask = () => {
    // Assign task logic
    console.log("Assigning task to:", representative.name);
  };

  const handleViewActivityLog = () => {
    // View activity log logic
    console.log("Viewing activity log for:", representative.name);
  };

  const handleSendMessage = () => {
    // Send message logic
    console.log("Sending message to:", representative.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("representativeProfile")} - {representative.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
            <TabsTrigger value="actions">{t("actions")}</TabsTrigger>
            <TabsTrigger value="activity">{t("activityLog")}</TabsTrigger>
            <TabsTrigger value="comments">{t("comments")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t("personalInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={representative.avatar} />
                      <AvatarFallback>{representative.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{representative.name}</h3>
                      <p className="text-sm text-gray-600">ID: {representative.id}</p>
                      <Badge className={representative.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {representative.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="name">{t("fullName")}</Label>
                    <Input
                      id="name"
                      value={editedRepresentative.name}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t("emailAddress")}</Label>
                    <Input
                      id="email"
                      value={editedRepresentative.email}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t("phoneNumber")}</Label>
                    <Input
                      id="phone"
                      value={editedRepresentative.phone}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">{t("address")}</Label>
                    <Textarea
                      id="address"
                      value={editedRepresentative.address || ""}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, address: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {t("workInformation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">{t("assignedVehicle")}</Label>
                    <Input
                      id="vehicle"
                      value={editedRepresentative.vehicle}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, vehicle: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="license">{t("driversLicenseNumber")}</Label>
                    <Input
                      id="license"
                      value={editedRepresentative.licenseNumber || ""}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, licenseNumber: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency">{t("emergencyContact")}</Label>
                    <Input
                      id="emergency"
                      value={editedRepresentative.emergencyContact || ""}
                      onChange={(e) => setEditedRepresentative({ ...editedRepresentative, emergencyContact: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">{t("status")}</Label>
                    <Select 
                      value={editedRepresentative.status} 
                      onValueChange={(value) => setEditedRepresentative({ ...editedRepresentative, status: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="inactive">{t("inactive")}</SelectItem>
                        <SelectItem value="on-route">{t("onRoute")}</SelectItem>
                        <SelectItem value="offline">{t("offline")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    {t("save")}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <User className="h-4 w-4 mr-2" />
                  {t("editProfile")}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{t("viewProfile")}</h3>
                      <p className="text-sm text-gray-600">{t("viewProfileDescription")}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={handleViewProfile}>
                    {t("viewProfile")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Navigation className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">{t("liveTracking")}</h3>
                      <p className="text-sm text-gray-600">{t("liveTrackingDescription")}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={handleLiveTracking}>
                    {t("startTracking")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Plus className="h-8 w-8 text-purple-600" />
                    <div>
                      <h3 className="font-semibold">{t("assignTask")}</h3>
                      <p className="text-sm text-gray-600">{t("assignTaskDescription")}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={handleAssignTask}>
                    {t("assignTask")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div>
                      <h3 className="font-semibold">{t("viewActivityLog")}</h3>
                      <p className="text-sm text-gray-600">{t("viewActivityLogDescription")}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={handleViewActivityLog}>
                    {t("viewActivityLog")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{t("sendMessage")}</h3>
                      <p className="text-sm text-gray-600">{t("sendMessageDescription")}</p>
                    </div>
                  </div>
                  <Button className="w-full mt-3" onClick={handleSendMessage}>
                    {t("sendMessage")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t("activityLog")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{t("deliveryCompleted")}</p>
                      <p className="text-sm text-gray-600">{t("deliveryTo")} Customer A - 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{t("locationUpdated")}</p>
                      <p className="text-sm text-gray-600">Downtown District - 10:15 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{t("taskAssigned")}</p>
                      <p className="text-sm text-gray-600">Delivery Task #123 - 9:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("comments")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t("addComment")}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddComment}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {comments.map((comment, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm">{comment}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
