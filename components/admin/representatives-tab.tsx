import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, MoreHorizontal, MapPin, Phone, Mail, Star, Truck, Filter, Download, Navigation, User, Calendar, Shield, Car, Clock, Copy, X, Activity, History, ChevronUp, ChevronDown, FileText, Package, Trash2, MessageSquare } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Dialog as UIDialog, DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from "@/components/ui/dialog";
import { AddRepresentativeModal } from "./add-representative-modal";
import { AssignTaskModal } from "./assign-task-modal";
import { MovementTrackingModal } from "./movement-tracking-modal";
import { RepresentativeVisitReportModal } from "./representative-visit-report-modal";
import { RepresentativePerformanceReportModal } from "./representative-performance-report-modal";
import { RepresentativeDeliveryReportModal } from "./representative-delivery-report-modal";
import { useLanguage } from "@/contexts/language-context";
import { getRepresentatives, generateRepresentativeId } from "@/lib/supabase-utils";
import { supabase } from "@/lib/supabase";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MovementReportGenerator } from "@/lib/movement-reports";
import { getAllRepresentativesMovementData } from "@/lib/movement-data";
import { getAllRepresentativesPerformance, getPerformanceStats } from "@/lib/performance";

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
  const [isVisitReportModalOpen, setIsVisitReportModalOpen] = useState(false);
  const [selectedVisitReportRepresentative, setSelectedVisitReportRepresentative] = useState<any>(null);
  const [isPerformanceReportModalOpen, setIsPerformanceReportModalOpen] = useState(false);
  const [selectedPerformanceReportRepresentative, setSelectedPerformanceReportRepresentative] = useState<any>(null);
  const [isDeliveryReportModalOpen, setIsDeliveryReportModalOpen] = useState(false);
  const [selectedDeliveryReportRepresentative, setSelectedDeliveryReportRepresentative] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({ id: '' });
  const [errors, setErrors] = useState({ id: '' });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const profileModalRef = useRef<HTMLDivElement>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRows, setHistoryRows] = useState<any[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarByDay, setCalendarByDay] = useState<Record<string,{movements:number,visits:number}>>({});
  const [calendarRange, setCalendarRange] = useState<{start: Date, end: Date} | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on-route' | 'offline'>('all');

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
      if (representative) {
        try {
          localStorage.setItem('chatTargetRepresentative', JSON.stringify({
            id: representative.id,
            name: representative.name,
            phone: representative.phone,
            email: representative.email,
            avatar_url: representative.avatar_url
          }));
        } catch {}
      }
      onNavigateToChatSupport();
    }
  };

  const handleViewMovementHistory = (representative: any) => {
    console.log('Opening movement tracking for:', representative);
    setSelectedMovementRepresentative(representative);
    setIsMovementTrackingModalOpen(true);
  };

  const handleViewVisitReport = (representative: any) => {
    console.log('Opening visit report for:', representative);
    setSelectedVisitReportRepresentative(representative);
    setIsVisitReportModalOpen(true);
  };

  const handleViewPerformanceReport = (representative: any) => {
    console.log('Opening performance report for:', representative);
    setSelectedPerformanceReportRepresentative(representative);
    setIsPerformanceReportModalOpen(true);
  };

  const handleViewDeliveryReport = (representative: any) => {
    console.log('Opening delivery report for:', representative);
    setSelectedDeliveryReportRepresentative(representative);
    setIsDeliveryReportModalOpen(true);
  };

  const handleDeleteRepresentative = async (representativeId: string) => {
    setDeleteLoading(representativeId);
    try {
      // Delete from representatives table
      const { error: repError } = await supabase
        .from('representatives')
        .delete()
        .eq('id', representativeId);

      if (repError) {
        console.error('Error deleting representative:', repError);
        alert(t("representative.deleteError") || `Failed to delete representative: ${repError.message}`);
        return;
      }

      // Delete from users table if exists
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', representativeId)
        .eq('role', 'representative');

      if (userError) {
        console.error('Error deleting user entry:', userError);
        // Don't fail if user entry doesn't exist
      }

      // Refresh the list
      const { data, error } = await getRepresentatives();
      if (error) {
        console.error('Error fetching representatives:', error);
      } else {
        setRepresentatives(data || []);
      }
    } catch (error: any) {
      console.error('Error deleting representative:', error);
      alert(t("representative.deleteError") || `Failed to delete representative: ${error.message}`);
    } finally {
      setDeleteLoading(null);
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

  // const handleDownloadPDFReport = async () => {
  //   if (!filteredMovementData) {
  //     alert('No movement data available to generate a PDF report.');
  //     return;
  //   }
  //
  //   try {
  //     const pdfBlob = await pdf(
  //       <MovementReportPDF movementData={filteredMovementData} />
  //     ).toBlob();
  //
  //     const url = URL.createObjectURL(pdfBlob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'movement-report.pdf';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('Error generating PDF report:', error);
  //     alert('Failed to generate PDF report. Please try again.');
  //   }
  // };

  const handleDownloadExcelReport = async () => {
    try {
      // Get performance data for all representatives
      const performanceData = await getAllRepresentativesPerformance();
      
      if (!performanceData || performanceData.length === 0) {
        alert(t("representative.noPerformanceData") || "No performance data available for report.");
        return;
      }

      // Calculate average performance metrics
      const totalRepresentatives = performanceData.length;
      const avgVisits = performanceData.reduce((sum, rep) => sum + (rep.total_visits || 0), 0) / totalRepresentatives;
      const avgDeliveries = performanceData.reduce((sum, rep) => sum + (rep.total_deliveries || 0), 0) / totalRepresentatives;
      const avgDistance = performanceData.reduce((sum, rep) => sum + (rep.total_distance || 0), 0) / totalRepresentatives;
      const avgRating = performanceData.reduce((sum, rep) => sum + (rep.average_rating || 0), 0) / totalRepresentatives;

      // Create summary report
      const summaryData = [
        { metric: 'Total Representatives', value: totalRepresentatives },
        { metric: 'Average Visits per Representative', value: avgVisits.toFixed(1) },
        { metric: 'Average Deliveries per Representative', value: avgDeliveries.toFixed(1) },
        { metric: 'Average Distance per Representative (km)', value: avgDistance.toFixed(2) },
        { metric: 'Average Rating', value: avgRating.toFixed(2) }
      ];

      // Create detailed performance data
      const detailedData = performanceData.map(rep => ({
        'Representative ID': rep.representative_id,
        'Name': rep.representative_name,
        'Total Visits': rep.total_visits || 0,
        'Total Deliveries': rep.total_deliveries || 0,
        'Total Distance (km)': rep.total_distance || 0,
        'Average Rating': rep.average_rating || 0,
        'Performance Score': rep.performance_score || 0,
        'Status': rep.status || 'Unknown',
        'Last Active': rep.last_active ? new Date(rep.last_active).toLocaleDateString() : 'N/A'
      }));

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Summary sheet
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Performance Summary');
      
      // Detailed data sheet
      const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Performance');

      // Add headers and styling
      const summaryRange = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1:B6');
      const detailedRange = XLSX.utils.decode_range(detailedSheet['!ref'] || 'A1:J1');

      // Auto-size columns
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 15 }];
      detailedSheet['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, 
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 12 }
      ];

      // Download the file
      XLSX.writeFile(workbook, `representatives-performance-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Error generating performance report:', error);
      alert(t("representative.reportError") || "Error generating performance report. Please try again.");
    }
  };

  const handleExportPDF = () => {
    // Create a minimal printable HTML with representatives table
    const columns = ["ID", "Name", "Email", "Phone", "Status"];
    const rows = representatives.map((r) => [
      r.id ?? "",
      r.name ?? "",
      r.email ?? "",
      r.phone ?? "",
      r.status ?? "",
    ]);
    const tableHead = `<tr>${columns.map((c) => `<th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">${c}</th>`).join("")}</tr>`;
    const tableRows = rows
      .map(
        (cells) =>
          `<tr>${cells
            .map((v) => `<td style="padding:8px;border-bottom:1px solid #f0f0f0;">${String(v)}</td>`)
            .join("")}</tr>`
      )
      .join("");
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Representatives</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 20px; color: #111827; }
            h1 { font-size: 18px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <h1>Representatives</h1>
          <table>
            <thead>${tableHead}</thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    } else {
      alert("Popup blocked. Please allow popups to export PDF.");
    }
  };

  const startChatFromSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    const match = representatives.find((rep) =>
      rep.name?.toLowerCase().includes(term) ||
      rep.email?.toLowerCase().includes(term) ||
      rep.phone?.includes(searchTerm)
    );
    if (match) {
      handleSendMessage(match);
    } else {
      alert(t("noRepresentatives") || "No matching representative found.");
    }
  };

  return (
    <div className="space-y-6">

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

      {/* Search, Filter and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t("searchRepresentatives")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                startChatFromSearch();
              }
            }}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {t("filter")}: {statusFilter === 'all' ? t("all") : t(statusFilter)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                {t("all")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                {t("active")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('on-route')}>
                {t("onRoute")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('offline')}>
                {t("offline")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("add")} {t("representative")}
          </Button>
          <Button variant="outline" onClick={() => exportToExcel(representatives)}>
            <Download className="h-4 w-4 mr-2" />
            {t("export")} Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            {t("export")} PDF
          </Button>
          <Button variant="outline" onClick={handleDownloadExcelReport}>
            <Star className="h-4 w-4 mr-2" />
            {t("export")} Performance Report
          </Button>
        </div>
      </div>


      {/* Representatives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {representatives
          .filter((rep) =>
            rep.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rep.phone?.includes(searchTerm)
          )
          .filter((rep) => {
            if (statusFilter === 'all') return true;
            return (rep.status ?? '').toLowerCase() === statusFilter;
          })
          .map((representative) => (
            <Card key={representative.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={representative.avatar_url || "/representative-avatar.png"} />
                      <AvatarFallback>
                        {representative.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
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
                      <DropdownMenuItem onClick={() => handleViewVisitReport(representative)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t("representative.visitReport")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewPerformanceReport(representative)}>
                        <Star className="h-4 w-4 mr-2" />
                        {t("representative.performanceReport")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewDeliveryReport(representative)}>
                        <Package className="h-4 w-4 mr-2" />
                        {t("representative.deliveryReport")}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("representative.removeRepresentative")}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("representative.removeRepresentative")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("representative.removeConfirmation").replace("{name}", representative.name)}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRepresentative(representative.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteLoading === representative.id ? (
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>{t("representative.deleting")}</span>
                                </div>
                              ) : (
                                t("representative.removeRepresentative")
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                    <span className="text-sm font-medium">{representative.rating || 0}</span>
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

      {/* Add Representative Modal */}
      <AddRepresentativeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRepresentative}
      />
      
      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
      />

      {/* Movement Tracking */}
      <MovementTrackingModal
        representative={selectedMovementRepresentative}
        isOpen={isMovementTrackingModalOpen}
        onClose={() => {
          setIsMovementTrackingModalOpen(false);
          setSelectedMovementRepresentative(null);
        }}
      />

      {/* Visit Report */}
      <RepresentativeVisitReportModal
        isOpen={isVisitReportModalOpen}
        onClose={() => {
          setIsVisitReportModalOpen(false);
          setSelectedVisitReportRepresentative(null);
        }}
        representative={selectedVisitReportRepresentative}
      />

      {/* Performance Report */}
      <RepresentativePerformanceReportModal
        isOpen={isPerformanceReportModalOpen}
        onClose={() => {
          setIsPerformanceReportModalOpen(false);
          setSelectedPerformanceReportRepresentative(null);
        }}
        representative={selectedPerformanceReportRepresentative}
      />

      {/* Delivery Report */}
      <RepresentativeDeliveryReportModal
        isOpen={isDeliveryReportModalOpen}
        onClose={() => {
          setIsDeliveryReportModalOpen(false);
          setSelectedDeliveryReportRepresentative(null);
        }}
        representative={selectedDeliveryReportRepresentative}
      />

      {/* Simple Profile Info Modal */}
      <Dialog open={isProfileInfoModalOpen} onOpenChange={() => setIsProfileInfoModalOpen(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("viewProfile")}</DialogTitle>
          </DialogHeader>
          {selectedProfileRepresentative && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedProfileRepresentative.avatar_url || "/representative-avatar.png"} />
                  <AvatarFallback>
                    {selectedProfileRepresentative.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedProfileRepresentative.name}</h3>
                  <p className="text-sm text-gray-600">ID: {selectedProfileRepresentative.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{selectedProfileRepresentative.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{selectedProfileRepresentative.phone}</span>
                </div>
                {selectedProfileRepresentative.address && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedProfileRepresentative.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
