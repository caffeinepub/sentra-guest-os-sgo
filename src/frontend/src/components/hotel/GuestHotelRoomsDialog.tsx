import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { BedDouble, Info, CreditCard } from 'lucide-react';
import type { RoomInventory, HotelProfile } from '../../backend';
import { formatCurrency } from '../../utils/formatCurrency';

interface GuestHotelRoomsDialogProps {
  hotelName: string;
  rooms: RoomInventory[];
  hotelProfile?: HotelProfile | null;
  trigger?: React.ReactNode;
}

export default function GuestHotelRoomsDialog({
  hotelName,
  rooms,
  hotelProfile,
  trigger,
}: GuestHotelRoomsDialogProps) {
  const hasContactInfo = hotelProfile?.payment_instructions;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            View Rooms
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Rooms at {hotelName}</DialogTitle>
          <DialogDescription>
            Browse available room types and pricing
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 pr-4">
            {/* Hotel Contact & Payment Information */}
            {hasContactInfo && (
              <>
                <Card className="bg-muted/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {hotelProfile?.payment_instructions && (
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Payment Method</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">{hotelProfile.payment_instructions}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Separator />
              </>
            )}

            {/* Room Listings */}
            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <BedDouble className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No rooms available</p>
                <p className="text-sm text-muted-foreground">
                  This hotel hasn't added room information yet
                </p>
              </div>
            ) : (
              <>
                {rooms.map((room, index) => (
                  <Card key={index}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative h-48 md:h-full min-h-[200px]">
                        {room.photos.length > 0 ? (
                          <div className="relative h-full">
                            <img
                              src={room.photos[0]}
                              alt={room.roomType}
                              className="w-full h-full object-cover rounded-l-lg"
                            />
                            {room.photos.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                +{room.photos.length - 1} more photo{room.photos.length > 2 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center rounded-l-lg">
                            <BedDouble className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 md:p-6 flex flex-col justify-between">
                        <div>
                          <CardHeader className="p-0 mb-3">
                            <CardTitle className="text-xl">{room.roomType}</CardTitle>
                            <CardDescription className="text-2xl font-bold text-foreground mt-2">
                              {formatCurrency(room.pricePerNight, room.currency)}
                              <span className="text-sm font-normal text-muted-foreground"> / night</span>
                            </CardDescription>
                          </CardHeader>
                          {room.promo && (
                            <Alert className="mb-3 border-green-500/50 bg-green-500/5">
                              <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <AlertDescription className="text-sm text-green-600 dark:text-green-400">
                                {room.promo}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        {room.photos.length > 1 && (
                          <div className="grid grid-cols-3 gap-2 mt-4">
                            {room.photos.slice(1, 4).map((photo, photoIndex) => (
                              <img
                                key={photoIndex}
                                src={photo}
                                alt={`${room.roomType} ${photoIndex + 2}`}
                                className="w-full h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
