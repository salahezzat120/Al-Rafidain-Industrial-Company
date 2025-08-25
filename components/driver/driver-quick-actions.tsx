import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Camera, AlertTriangle, Clock, MessageSquare } from "lucide-react"

export function DriverQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Clock className="h-5 w-5" />
            <span className="text-xs">Clock In/Out</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <MapPin className="h-5 w-5" />
            <span className="text-xs">Share Location</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Camera className="h-5 w-5" />
            <span className="text-xs">Photo Proof</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs">Report Issue</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <Phone className="h-5 w-5" />
            <span className="text-xs">Call Support</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2 bg-transparent">
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">Messages</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
