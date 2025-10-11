import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  MapPin, Clock, Navigation, Activity, Download, Calendar as CalendarIcon,
  Filter, Search, BarChart3, Route, User, Phone, Mail, Truck, Star
} from "lucide-react";
import { format as formatDate } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { RepresentativeMovement, RepresentativeVisit, MovementTrackingFilters, MovementTrackingStats, MovementReportData } from "@/types/movement-tracking";
import { MovementReportGenerator } from "@/lib/movement-reports";

interface MovementTrackingModalProps {
  representative: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MovementTrackingModal({ representative, isOpen, onClose }: MovementTrackingModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("movements");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [filters, setFilters] = useState<MovementTrackingFilters>({});
  const [movements, setMovements] = useState<RepresentativeMovement[]>([]);
  const [visits, setVisits] = useState<RepresentativeVisit[]>([]);
  const [stats, setStats] = useState<MovementTrackingStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && representative) {
      fetchMovementData();
    }
  }, [isOpen, representative, filters, selectedDate, dateRange]);

  const fetchMovementData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API calls
      const mockMovements: RepresentativeMovement[] = [
        {
          id: "1",
          representative_id: representative.id,
          latitude: 24.7136,
          longitude: 46.6753,
          location_name: "Downtown Riyadh",
          activity_type: "check_in",
          description: "Started work day",
          duration_minutes: 0,
          distance_km: 0,
          speed_kmh: 0,
          accuracy_meters: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          representative_id: representative.id,
          latitude: 24.7200,
          longitude: 46.6800,
          location_name: "Customer A Location",
          activity_type: "delivery_start",
          description: "Started delivery to Customer A",
          duration_minutes: 15,
          distance_km: 2.5,
          speed_kmh: 25,
          accuracy_meters: 3,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          representative_id: representative.id,
          latitude: 24.7200,
          longitude: 46.6800,
          location_name: "Customer A Location",
          activity_type: "delivery_complete",
          description: "Completed delivery to Customer A",
          duration_minutes: 30,
          distance_km: 0,
          speed_kmh: 0,
          accuracy_meters: 3,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
        },
      ];

      const mockVisits: RepresentativeVisit[] = [
        {
          id: "1",
          representative_id: representative.id,
          visit_type: "customer_visit",
          customer_name: "Ahmed Al-Rashid",
          customer_address: "123 King Fahd Road, Riyadh",
          visit_purpose: "Product demonstration",
          scheduled_start_time: new Date().toISOString(),
          scheduled_end_time: new Date(Date.now() + 3600000).toISOString(),
          actual_start_time: new Date(Date.now() - 3600000).toISOString(),
          actual_end_time: new Date(Date.now() - 1800000).toISOString(),
          status: "completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockStats: MovementTrackingStats = {
        total_movements: 3,
        total_distance_km: 7.8,
        total_duration_hours: 8.5,
        unique_locations: 2,
        most_common_activity: "delivery_start",
        average_speed_kmh: 20,
      };

      setMovements(mockMovements);
      setVisits(mockVisits);
      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching movement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'excel') => {
    try {
      const reportData: MovementReportData = {
        representative_name: representative.name,
        representative_id: representative.id,
        date_range: {
          start_date: dateRange.from ? formatDate(dateRange.from, 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
          end_date: dateRange.to ? formatDate(dateRange.to, 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
        },
        movements,
        visits,
        daily_summaries: [], // This would be populated from API
        stats: stats || {
          total_movements: 0,
          total_distance_km: 0,
          total_duration_hours: 0,
          unique_locations: 0,
          most_common_activity: '',
          average_speed_kmh: 0,
        },
      };

      const filters = {
        representative_id: representative.id,
        start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        include_movements: true,
        include_visits: true,
        include_summary: true,
      };

      let blob: Blob;
      let filename: string;

      if (format === 'excel') {
        blob = await MovementReportGenerator.generateExcelReport(reportData, filters);
        filename = `movement-report-${representative.name}-${formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`;
      } else {
        blob = await MovementReportGenerator.generatePDFReport(reportData, filters);
        filename = `movement-report-${representative.name}-${formatDate(new Date(), 'yyyy-MM-dd')}.txt`;
      }

      MovementReportGenerator.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case "check_in":
        return "bg-green-100 text-green-800";
      case "check_out":
        return "bg-red-100 text-red-800";
      case "delivery_start":
        return "bg-blue-100 text-blue-800";
      case "delivery_complete":
        return "bg-green-100 text-green-800";
      case "visit_start":
        return "bg-purple-100 text-purple-800";
      case "visit_end":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter movements based on current filters
  const filteredMovements = movements.filter((movement) => {
    // Filter by activity type
    if (filters.activity_type && movement.activity_type !== filters.activity_type) {
      return false;
    }

    // Filter by location name
    if (filters.location_name && 
        !movement.location_name.toLowerCase().includes(filters.location_name.toLowerCase())) {
      return false;
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
      const movementDate = new Date(movement.created_at);
      
      if (dateRange.from && movementDate < dateRange.from) {
        return false;
      }
      
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (movementDate > endOfDay) {
          return false;
        }
      }
    }

    return true;
  });

  // Filter visits based on current filters
  const filteredVisits = visits.filter((visit) => {
    // Filter by date range
    if (dateRange.from || dateRange.to) {
      const visitDate = new Date(visit.created_at);
      
      if (dateRange.from && visitDate < dateRange.from) {
        return false;
      }
      
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (visitDate > endOfDay) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Navigation className="h-6 w-6" />
            Movement Tracking - {representative?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="movements">Movements</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Activity Type</Label>
                    <Select
                      value={filters.activity_type || "all"}
                      onValueChange={(value) => setFilters({ ...filters, activity_type: value === "all" ? undefined : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Activities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Activities</SelectItem>
                        <SelectItem value="check_in">Check In</SelectItem>
                        <SelectItem value="check_out">Check Out</SelectItem>
                        <SelectItem value="delivery_start">Delivery Start</SelectItem>
                        <SelectItem value="delivery_complete">Delivery Complete</SelectItem>
                        <SelectItem value="visit_start">Visit Start</SelectItem>
                        <SelectItem value="visit_end">Visit End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              `${formatDate(dateRange.from, "MMM dd")} - ${formatDate(dateRange.to, "MMM dd")}`
                            ) : (
                              formatDate(dateRange.from, "MMM dd")
                            )
                          ) : (
                            "Select date range"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="Search locations..."
                      value={filters.location_name || ""}
                      onChange={(e) => setFilters({ ...filters, location_name: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                {(filters.activity_type || filters.location_name || dateRange.from || dateRange.to) && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters({});
                        setDateRange({ from: undefined, to: undefined });
                      }}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Movements List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Movement History
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {filteredMovements.length} of {movements.length} movements
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading movements...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredMovements.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No movements found matching the current filters.
                      </div>
                    ) : (
                      filteredMovements.map((movement) => (
                      <div key={movement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getActivityColor(movement.activity_type)}>
                              {movement.activity_type.replace("_", " ")}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(movement.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium">{movement.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {movement.location_name}
                            </div>
                            {movement.distance_km && (
                              <div className="flex items-center gap-1">
                                <Route className="h-4 w-4" />
                                {movement.distance_km} km
                              </div>
                            )}
                            {movement.duration_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {movement.duration_minutes} min
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Visit History
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {filteredVisits.length} of {visits.length} visits
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVisits.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No visits found matching the current filters.
                    </div>
                  ) : (
                    filteredVisits.map((visit) => (
                    <div key={visit.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(visit.status)}>
                          {visit.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(visit.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-medium">{visit.customer_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{visit.visit_purpose}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {visit.customer_address}
                        </div>
                        {visit.customer_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {visit.customer_phone}
                          </div>
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Activities for Selected Date</h4>
                    {selectedDate ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          {formatDate(selectedDate, "EEEE, MMMM do, yyyy")}
                        </p>
                        <div className="space-y-2">
                          {filteredMovements
                            .filter((movement) => 
                              new Date(movement.created_at).toDateString() === selectedDate.toDateString()
                            )
                            .map((movement) => (
                              <div key={movement.id} className="p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <Badge className={getActivityColor(movement.activity_type)}>
                                    {movement.activity_type.replace("_", " ")}
                                  </Badge>
                                  <span className="text-sm">
                                    {new Date(movement.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm">{movement.description}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Select a date to view activities</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Total Movements</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{stats.total_movements}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button onClick={() => handleDownloadReport('pdf')} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </Button>
                  <Button variant="outline" onClick={() => handleDownloadReport('excel')} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Excel Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
