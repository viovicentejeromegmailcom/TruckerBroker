import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Calendar, 
  MapPin, 
  DollarSign,
  Clock,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";

interface JobListingCardProps {
  id: number;
  title: string;
  companyName: string;
  status: "active" | "pending" | "completed" | "cancelled";
  loadType: string;
  pickupDate: Date;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  price: number;
  distance?: number;
  viewButtonText?: string;
  onViewClick?: () => void;
}

export default function JobListingCard({
  id,
  title,
  companyName,
  status,
  loadType,
  pickupDate,
  originCity,
  originState,
  destinationCity,
  destinationState,
  price,
  distance,
  viewButtonText = "View",
  onViewClick
}: JobListingCardProps) {
  const statusColor = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800"
  };
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(pickupDate));

  const handleViewClick = () => {
    if (onViewClick) {
      onViewClick();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-primary-500 truncate">
                  {title}
                </h3>
                <p className="text-sm text-secondary-500">{companyName}</p>
              </div>
            </div>
            <div>
              <Badge className={statusColor[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center text-sm text-secondary-500">
              <Truck className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
              <span>{loadType}</span>
            </div>
            <div className="flex items-center text-sm text-secondary-500">
              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
              <span>Pickup: {formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-secondary-500">
              <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
              <span>{originCity}, {originState} to {destinationCity}, {destinationState}</span>
            </div>
            <div className="flex items-center text-sm text-secondary-500">
              <DollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
              <span>${price.toLocaleString()}</span>
            </div>
            {distance && (
              <div className="flex items-center text-sm text-secondary-500">
                <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-secondary-400" />
                <span>~{distance} miles</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-secondary-50 px-4 py-3 text-right sm:px-6 border-t border-secondary-200">
          <Button 
            variant="default" 
            size="sm"
            className="space-x-1"
            asChild={!onViewClick}
            onClick={onViewClick ? handleViewClick : undefined}
          >
            {onViewClick ? (
              <>
                <span>{viewButtonText}</span>
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <Link href={`/jobs/${id}`}>
                <a className="flex items-center">
                  <span>{viewButtonText}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
