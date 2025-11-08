import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Star, Truck, Filter, Download, Navigation, User, Calendar, Shield, Car, Clock, Copy, X, Activity, History, ChevronUp, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AddRepresentativeModal } from "./add-representative-modal";
import { AssignTaskModal } from "./assign-task-modal";
import { MovementTrackingModal } from "./movement-tracking-modal";
import { useLanguage } from "@/contexts/language-context";
import { getRepresentatives, generateRepresentativeId } from "@/lib/supabase-utils";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertCircle } from "@/components/ui/alert";
import { MovementReportGenerator } from "@/lib/movement-reports";
import { getAllRepresentativesMovementData } from "@/lib/movement-data";

interface RepresentativesTabProps {
  onNavigateToChatSupport?: () => void
  onNavigateToDeliveryTasks?: () => void
  onNavigateToLiveMap?: (representativeName?: string) => void
}

export function RepresentativesTab({ onNavigateToChatSupport, onNavigateToDeliveryTasks, onNavigateToLiveMap }: RepresentativesTabProps = {}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isProfileInfoModalOpen, setIsProfileInfoModalOpen] = useState(false);
  const [selectedProfileRepresentative, setSelectedProfileRepresentative] = useState<any>(null);
  const [isMovementTrackingModalOpen, setIsMovementTrackingModalOpen] = useState(false);
  const [selectedMovementRepresentative, setSelectedMovementRepresentative] = useState<any>(null);
  const [formData, setFormData] = useState({ id: '' });
  const [errors, setErrors] = useState({ id: '' });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const profileModalRef = useRef<HTMLDivElement>(null);

  const { t, isRTL } = useLanguage();

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

  // Track scroll progress for profile modal
  useEffect(() => {
    const handleScroll = () => {
      if (profileModalRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = profileModalRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    const modal = profileModalRef.current;
    if (modal) {
      modal.addEventListener('scroll', handleScroll);
      return () => modal.removeEventListener('scroll', handleScroll);
    }
  }, [isProfileInfoModalOpen]);

  // Show scroll hint when profile modal opens
  useEffect(() => {
    if (isProfileInfoModalOpen) {
      const timer = setTimeout(() => {
        setShowScrollHint(true);
        setTimeout(() => setShowScrollHint(false), 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isProfileInfoModalOpen]);


  const handleAddRepresentative = (newRepresentative: any) => {
    setRepresentatives((prev) => [...prev, newRepresentative]);
  };

  // New modal handlers
  const handleViewProfile = (representative: any) => {
    console.log('Showing representative profile info for:', representative);
    setSelectedProfileRepresentative(representative);
    setIsProfileInfoModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Scroll functionality for profile modal
  const scrollToTop = () => {
    if (profileModalRef.current) {
      profileModalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (profileModalRef.current) {
      profileModalRef.current.scrollTo({ top: profileModalRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      scrollToTop();
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      scrollToBottom();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-route':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLiveTracking = (representative?: any) => {
    console.log('Navigating to live map for representative:', representative);
    console.log('onNavigateToLiveMap function exists:', !!onNavigateToLiveMap);
    
    // Navigate to live map tab with representative name
    if (onNavigateToLiveMap) {
      const representativeName = representative?.name || representative?.representative_name;
      console.log('Representative name to search for:', representativeName);
      onNavigateToLiveMap(representativeName);
    } else {
      console.error('onNavigateToLiveMap function is not provided!');
    }
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

  const handleViewMovementHistory = (representative: any) => {
    console.log('Opening movement tracking for:', representative);
    setSelectedMovementRepresentative(representative);
    setIsMovementTrackingModalOpen(true);
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

  const handleDownloadPDFReport = async () => {
    try {
      console.log('Generating PDF report for all representatives...');
      
      // Get date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const { data: movementData, error } = await getAllRepresentativesMovementData({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
      if (error) {
        console.error('Error fetching movement data:', error);
        alert('Error generating report: ' + error);
        return;
      }
      
      if (!movementData || movementData.length === 0) {
        alert('No movement data found for the selected period.');
        return;
      }
      
      // Generate PDF report for the first representative (or combine all)
      const reportData = movementData[0]; // For now, use first representative
      const filters = {
        representative_id: reportData.representative_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        include_movements: true,
        include_visits: true,
        include_summary: true
      };
      
      const pdfBlob = await MovementReportGenerator.generatePDFReport(reportData, filters);
      const filename = `movement_report_${reportData.representative_name.replace(/\s+/g, '_')}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`;
      
      MovementReportGenerator.downloadBlob(pdfBlob, filename);
      console.log('PDF report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const handleDownloadExcelReport = async () => {
    try {
      console.log('Generating Excel report for all representatives...');
      
      // Get date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const { data: movementData, error } = await getAllRepresentativesMovementData({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
      if (error) {
        console.error('Error fetching movement data:', error);
        alert('Error generating report: ' + error);
        return;
      }
      
      if (!movementData || movementData.length === 0) {
        alert('No movement data found for the selected period.');
        return;
      }
      
      // Generate Excel report for the first representative (or combine all)
      const reportData = movementData[0]; // For now, use first representative
      const filters = {
        representative_id: reportData.representative_id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        include_movements: true,
        include_visits: true,
        include_summary: true
      };
      
      const excelBlob = await MovementReportGenerator.generateExcelReport(reportData, filters);
      const filename = `movement_report_${reportData.representative_name.replace(/\s+/g, '_')}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
      
      MovementReportGenerator.downloadBlob(excelBlob, filename);
      console.log('Excel report downloaded successfully');
    } catch (error) {
      console.error('Error generating Excel report:', error);
      alert('Error generating Excel report. Please try again.');
    }
  };


  return (
    <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-gray-900">{t("representativeManagement")}</h2>
          <p className="text-gray-600">{t("manageDeliveryTeam")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToExcel(representatives)}>
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} {t("representative")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                if (representatives.length > 0) {
                  handleViewMovementHistory(representatives[0]);
                }
              }}>
                <History className="h-4 w-4 mr-2" />
                {t("viewHistoricalLogs")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (representatives.length > 0) {
                  handleViewMovementHistory(representatives[0]);
                }
              }}>
                <Calendar className="h-4 w-4 mr-2" />
                {t("calendarView")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDFReport}>
                <Download className="h-4 w-4 mr-2" />
                {t("downloadPDFReport")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadExcelReport}>
                <Download className="h-4 w-4 mr-2" />
                {t("downloadExcelReport")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                        handleLiveTracking(representative);
                      }}>
                        {t("liveTracking")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignTask(representative.id)}>
                        {t("assignTask")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendMessage(representative)}>
                        {t("sendMessage")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewMovementHistory(representative)}>
                        <Activity className="h-4 w-4 mr-2" />
                        {t("viewMovementHistory")}
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

      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        onAssign={(taskData) => {
          console.log('Task assigned:', taskData);
          setIsAssignTaskModalOpen(false);
        }}
      />

      <MovementTrackingModal
        representative={selectedMovementRepresentative}
        isOpen={isMovementTrackingModalOpen}
        onClose={() => setIsMovementTrackingModalOpen(false)}
      />

      {/* Enhanced Profile Information Modal */}
      <Dialog open={isProfileInfoModalOpen} onOpenChange={setIsProfileInfoModalOpen}>
        <DialogContent 
          ref={profileModalRef}
          onKeyDown={handleKeyDown}
          className="max-w-4xl max-h-[95vh] overflow-hidden"
        >
          {/* Scroll Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-10">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -m-6 mb-0 p-6">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedProfileRepresentative?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {selectedProfileRepresentative?.name?.charAt(0) || 'R'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{selectedProfileRepresentative?.name || 'Representative'}</h2>
                <p className="text-gray-600">ID: {selectedProfileRepresentative?.id || 'N/A'}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Complete profile information for this representative
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-6">
            <div className="space-y-6 py-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{selectedProfileRepresentative?.name || 'N/A'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedProfileRepresentative?.name || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <Badge className={getStatusColor(selectedProfileRepresentative?.status)}>
                      {selectedProfileRepresentative?.status || 'N/A'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.email || 'N/A'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedProfileRepresentative?.email || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.phone || 'N/A'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedProfileRepresentative?.phone || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.address || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Current Location</Label>
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.location || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-500">Coverage Areas</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfileRepresentative?.coverage_areas?.length > 0 ? (
                        selectedProfileRepresentative.coverage_areas.map((area: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {area}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">No coverage areas specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">License Number</Label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.license_number || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Transportation Type</Label>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span className="text-base capitalize">{selectedProfileRepresentative?.transportation_type || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Vehicle</Label>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.vehicle || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-base">{selectedProfileRepresentative?.emergency_contact || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Created At</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-base">
                        {selectedProfileRepresentative?.created_at 
                          ? new Date(selectedProfileRepresentative.created_at).toLocaleString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-base">
                        {selectedProfileRepresentative?.updated_at 
                          ? new Date(selectedProfileRepresentative.updated_at).toLocaleString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Scroll Navigation Buttons */}
          {scrollProgress > 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToTop}
              className="absolute top-20 right-4 z-20 bg-white shadow-lg"
              title="Scroll to top (Ctrl+↑)"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          
          {scrollProgress < 95 && (
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 z-20 bg-white shadow-lg"
              title="Scroll to bottom (Ctrl+↓)"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}

          {/* Scroll Hint Overlay */}
          {showScrollHint && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <div className="text-lg font-semibold mb-2">📜 Scrollable Content</div>
                <div className="text-sm text-gray-600 mb-4">
                  Use mouse wheel, scrollbar, or keyboard shortcuts to navigate
                </div>
                <div className="text-xs text-gray-500">
                  <div>Ctrl + ↑ : Scroll to top</div>
                  <div>Ctrl + ↓ : Scroll to bottom</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t px-6">
            <Button
              variant="outline"
              onClick={() => {
                const profileText = `
Representative: ${selectedProfileRepresentative?.name || 'N/A'}
ID: ${selectedProfileRepresentative?.id || 'N/A'}
Email: ${selectedProfileRepresentative?.email || 'N/A'}
Phone: ${selectedProfileRepresentative?.phone || 'N/A'}
Status: ${selectedProfileRepresentative?.status || 'N/A'}
Location: ${selectedProfileRepresentative?.location || 'N/A'}
                `.trim();
                copyToClipboard(profileText);
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Profile
            </Button>
            <Button onClick={() => setIsProfileInfoModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
