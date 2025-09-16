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
import { useLanguage } from "@/contexts/language-context";
import { getRepresentatives } from "@/lib/supabase-utils";
import * as XLSX from 'xlsx';
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertCircle } from "@/components/ui/alert";

export function RepresentativesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
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
    </div>
  );
}
