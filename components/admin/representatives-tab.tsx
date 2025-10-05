import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Star, Truck, Filter, Download, Navigation } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RepresentativeProfileModal } from "./representative-profile-modal";
import { AddRepresentativeModal } from "./add-representative-modal";
import { LiveTrackingModal } from "./live-tracking-modal";
import { AssignTaskModal } from "./assign-task-modal";
import { useLanguage } from "@/contexts/language-context";
import { getRepresentatives, generateRepresentativeId, testRepresentativesTable, testSimpleInsert } from "@/lib/supabase-utils";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertCircle } from "@/components/ui/alert";

interface RepresentativesTabProps {
  onNavigateToChatSupport?: () => void
  onNavigateToDeliveryTasks?: () => void
}

export function RepresentativesTab({ onNavigateToChatSupport, onNavigateToDeliveryTasks }: RepresentativesTabProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '' });
  const [errors, setErrors] = useState({ id: '' });

  const { t } = useLanguage();

  useEffect(() => {
    const fetchRepresentatives = async () => {
      const { data, error } = await getRepresentatives();
      if (error) {
        console.error('Error fetching representatives:', error);
      } else {
        setRepresentatives(data || []);
      }
    };

    fetchRepresentatives();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on-route":
        return "bg-blue-100 text-blue-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddRepresentative = (newRepresentative: any) => {
    setRepresentatives((prev) => [...prev, newRepresentative]);
  };

  // New modal handlers
  const handleViewProfile = (representative: any) => {
    console.log('Opening representative profile for:', representative);
    console.log('Setting selectedRepresentative to:', representative);
    setSelectedRepresentative(representative);
    console.log('Setting isProfileModalOpen to true');
    setIsProfileModalOpen(true);
    console.log('Modal should now be open');
  };

  const handleLiveTracking = () => {
    console.log('Opening live tracking modal');
    setIsTrackingModalOpen(true);
  };

  const handleAssignTask = (representativeId?: string) => {
    console.log('Navigating to delivery tasks for representative:', representativeId);
    
    // Navigate to delivery tasks tab instead of opening assign task modal
    if (onNavigateToDeliveryTasks) {
      onNavigateToDeliveryTasks();
      return;
    }
    
    // Fallback to original behavior if navigation function is not provided
    setIsAssignTaskModalOpen(true);
  };

  const handleSendMessage = (representative?: any) => {
    console.log('Navigating to chat support for representative:', representative);
    
    // Navigate to chat support tab
    if (onNavigateToChatSupport) {
      onNavigateToChatSupport();
    }
  };

  const getStatusStats = () => {
    const active = representatives.filter((d) => d.status === "active").length;
    const onRoute = representatives.filter((d) => d.status === "on-route").length;
    const offline = representatives.filter((d) => d.status === "offline").length;
    const avgRating = representatives.reduce((sum, d) => sum + d.rating, 0) / representatives.length;

    return { active, onRoute, offline, avgRating: avgRating.toFixed(1) };
  };

  const stats = getStatusStats();

  const exportToExcel = (representatives: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(representatives);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Representatives');
    XLSX.writeFile(workbook, 'representatives.xlsx');
  };

  const generateRepresentativeIdHandler = async () => {
    const representativeId = await generateRepresentativeId();
    setFormData(prev => ({ ...prev, id: representativeId }));
  };

  const testTableConnection = async () => {
    console.log('Testing representatives table connection...');
    const result = await testRepresentativesTable();
    if (result.success) {
      console.log('✅ Table connection successful!');
      alert('✅ Table connection successful!');
    } else {
      console.log('❌ Table connection failed:', result.error);
      alert(`❌ Table connection failed: ${result.error}`);
    }
  };

  const testInsert = async () => {
    console.log('Testing simple insert...');
    const result = await testSimpleInsert();
    if (result.success) {
      console.log('✅ Insert test successful!');
      alert('✅ Insert test successful!');
      // Refresh the representatives list
      const { data, error } = await getRepresentatives();
      if (!error) {
        setRepresentatives(data || []);
      }
    } else {
      console.log('❌ Insert test failed:', result.error);
      alert(`❌ Insert test failed: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("representativeManagement")}</h2>
          <p className="text-gray-600">{t("manageDeliveryTeam")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testTableConnection}>
            🔧 Test Table
          </Button>
          <Button variant="outline" onClick={testInsert}>
            🧪 Test Insert
          </Button>
          <Button variant="outline" onClick={() => exportToExcel(representatives)}>
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} {t("representative")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("activeRepresentatives")}</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("onRoute")}</p>
                <p className="text-xl font-bold">{stats.onRoute}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("offline")}</p>
                <p className="text-xl font-bold">{stats.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{t("avgRating")}</p>
                <p className="text-xl font-bold">{stats.avgRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("searchRepresentatives")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t("filter")}
        </Button>
      </div>

      {/* Representatives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {representatives
          .filter((rep) =>
            rep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.phone?.includes(searchTerm)
          )
          .map((representative) => (
            <Card key={representative.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={representative.avatar_url || "/representative-avatar.png"} />
                      <AvatarFallback>
                        {representative.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{representative.name}</h3>
                      <p className="text-sm text-gray-600">ID: {representative.id}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewProfile(representative)}>
                        {t("viewProfile")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedRepresentative(representative);
                        handleLiveTracking();
                      }}>
                        {t("liveTracking")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignTask(representative.id)}>
                        {t("assignTask")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendMessage(representative)}>
                        {t("sendMessage")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{representative.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{representative.phone}</span>
                </div>
                {representative.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{representative.address}</span>
                  </div>
                )}
                {representative.vehicle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>{representative.vehicle}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(representative.status)}>
                    {representative.status}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">4.5</span>
                  </div>
                </div>
                {representative.coverage_areas && representative.coverage_areas.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">{t("coverageAreas")}:</p>
                    <div className="flex flex-wrap gap-1">
                      {representative.coverage_areas.slice(0, 2).map((area: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {representative.coverage_areas.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{representative.coverage_areas.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Empty State */}
      {representatives.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noRepresentatives")}</h3>
          <p className="text-gray-600 mb-4">{t("getStartedByAddingRepresentative")}</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} {t("representative")}
          </Button>
        </div>
      )}

      {/* Modals */}
      <AddRepresentativeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRepresentative}
      />

      <RepresentativeProfileModal
        representative={selectedRepresentative}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={(representative) => {
          // Handle save logic
          setIsProfileModalOpen(false);
        }}
      />

      <LiveTrackingModal
        representative={selectedRepresentative}
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        onAssign={(taskData) => {
          console.log('Task assigned:', taskData);
          setIsAssignTaskModalOpen(false);
        }}
      />

    </div>
  );
}
