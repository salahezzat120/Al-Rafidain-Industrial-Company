'use client';

import React, { useState, useEffect } from 'react';
import { ScrollableDialog } from '@/components/ui/scrollable-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  FileText,
  TrendingUp,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useCurrency } from '@/contexts/currency-context';
import { getRepresentativeVisits, calculateVisitStats, type Visit, type VisitStats } from '@/lib/visits';
import * as XLSX from 'xlsx';

interface RepresentativeVisitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  representative: any;
}


export function RepresentativeVisitReportModal({ 
  isOpen, 
  onClose, 
  representative 
}: RepresentativeVisitReportModalProps) {
  const { t } = useLanguage();
  const { formatCurrency } = useCurrency();
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitStats>({
    totalVisits: 0,
    completedVisits: 0,
    cancelledVisits: 0,
    noShowVisits: 0,
    successRate: 0,
    averageDuration: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (isOpen && representative) {
      fetchVisitData();
    }
  }, [isOpen, representative]);

  const fetchVisitData = async () => {
    if (!representative) return;
    
    setLoading(true);
    try {
      const { data: visitData, error } = await getRepresentativeVisits(representative.id);
      
      if (error) {
        console.error('Error fetching visit data:', error);
        setVisits([]);
        setStats({
          totalVisits: 0,
          completedVisits: 0,
          cancelledVisits: 0,
          noShowVisits: 0,
          successRate: 0,
          averageDuration: 0
        });
      } else {
        setVisits(visitData);
        const calculatedStats = calculateVisitStats(visitData);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error fetching visit data:', error);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };


  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.customer_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.customer_phone && visit.customer_phone.includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const visitDate = new Date(visit.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return visitDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return visitDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return visitDate >= monthAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      no_show: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      scheduled: { color: 'bg-gray-100 text-gray-800', icon: Calendar }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToExcel = () => {
    const exportData = filteredVisits.map(visit => ({
      'Representative Name': representative.name,
      'Representative ID': representative.id,
      'Client Name': visit.customer_name,
      'Client Location': visit.customer_address,
      'Client Phone Number': visit.customer_phone || 'N/A',
      'Visit Type': visit.visit_type,
      'Scheduled Start': formatDate(visit.scheduled_start_time),
      'Scheduled End': formatDate(visit.scheduled_end_time),
      'Actual Start': visit.actual_start_time ? formatDate(visit.actual_start_time) : 'N/A',
      'Actual End': visit.actual_end_time ? formatDate(visit.actual_end_time) : 'N/A',
      'Status': visit.status,
      'Success': visit.status === 'completed' ? 'Yes' : 'No',
      'Notes': visit.notes || 'N/A',
      'Created At': formatDate(visit.created_at)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Visit Report');
    
    const fileName = `${representative.name}_Visit_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };


  if (!representative) return null;

  const footer = (
    <div className="flex justify-end gap-3">
      <Button onClick={exportToExcel} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export to Excel
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Visit Report - ${representative.name}`}
      description={`Comprehensive visit tracking and performance report for ${representative.name}`}
      maxWidth="max-w-6xl"
      showScrollButtons={true}
      scrollAmount={300}
      footer={footer}
    >
          {/* Representative Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={representative.avatar_url || "/representative-avatar.png"} />
                  <AvatarFallback>
                    {representative.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{representative.name}</h3>
                  <p className="text-sm text-gray-600">ID: {representative.id}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{representative.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{representative.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{representative.address || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Visits</p>
                    <p className="text-2xl font-bold">{stats.totalVisits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold">{stats.completedVisits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold">{stats.averageDuration.toFixed(0)}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Visits Table */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading visit data...</p>
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'No visits have been recorded for this representative'
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Visit Type</TableHead>
                        <TableHead>Scheduled Time</TableHead>
                        <TableHead>Actual Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Success</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium">{visit.customer_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{visit.customer_address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{visit.customer_phone || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{visit.visit_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(visit.scheduled_start_time)}</div>
                              <div className="text-gray-500">to {formatDate(visit.scheduled_end_time)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit.actual_start_time && visit.actual_end_time ? (
                              <div className="text-sm">
                                <div>{formatDate(visit.actual_start_time)}</div>
                                <div className="text-gray-500">to {formatDate(visit.actual_end_time)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(visit.status)}</TableCell>
                          <TableCell>
                            {visit.status === 'completed' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Yes
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {visit.notes || 'No notes'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
    </ScrollableDialog>
  );
}
