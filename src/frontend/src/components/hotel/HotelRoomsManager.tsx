import { useState } from 'react';
import { useGetHotelProfile } from '../../hooks/useHotelProfile';
import { useUpdateRoomInventory, useDeleteRoomInventory } from '../../hooks/useRoomInventory';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BedDouble, Plus, Edit, Trash2, Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';
import type { RoomInventory } from '../../backend';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export default function HotelRoomsManager() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading, isFetching: profileRefetching } = useGetHotelProfile();
  const updateRoom = useUpdateRoomInventory();
  const deleteRoom = useDeleteRoomInventory();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomInventory | null>(null);

  const [formData, setFormData] = useState({
    roomType: '',
    pricePerNight: '',
    promo: '',
    photos: [] as string[],
  });

  const [imageError, setImageError] = useState<string | null>(null);

  const hotelPrincipal = identity?.getPrincipal();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, base64],
      }));
    };
    reader.onerror = () => {
      setImageError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotelPrincipal) {
      toast.error('Authentication required');
      return;
    }

    const price = parseInt(formData.pricePerNight);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (formData.photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }

    const room: RoomInventory = {
      roomType: formData.roomType.trim(),
      pricePerNight: BigInt(price),
      promo: formData.promo.trim() || undefined,
      photos: formData.photos,
    };

    try {
      await updateRoom.mutateAsync({ hotelPrincipal, room });
      toast.success(editingRoom ? 'Room updated successfully' : 'Room created successfully');
      handleCloseDialog();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleOpenCreateDialog = () => {
    setEditingRoom(null);
    setFormData({
      roomType: '',
      pricePerNight: '',
      promo: '',
      photos: [],
    });
    setImageError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (room: RoomInventory) => {
    setEditingRoom(room);
    setFormData({
      roomType: room.roomType,
      pricePerNight: room.pricePerNight.toString(),
      promo: room.promo || '',
      photos: room.photos,
    });
    setImageError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (roomType: string) => {
    if (!hotelPrincipal) {
      toast.error('Authentication required');
      return;
    }

    if (!confirm(`Are you sure you want to delete the room "${roomType}"?`)) {
      return;
    }

    try {
      await deleteRoom.mutateAsync({ hotelPrincipal, roomType });
      toast.success('Room deleted successfully');
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRoom(null);
    setFormData({
      roomType: '',
      pricePerNight: '',
      promo: '',
      photos: [],
    });
    setImageError(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseDialog();
    }
  };

  const rooms = profile?.rooms || [];
  const isEdit = editingRoom !== null;

  // Only show loading spinner during initial load, not during refetch
  // This prevents the dialog from unmounting while open
  const showLoadingSpinner = profileLoading && !profile;

  if (showLoadingSpinner) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                Room Inventory
                {profileRefetching && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>Manage your hotel's room types and pricing</CardDescription>
            </div>
            <Button className="gap-2" onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <BedDouble className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">No rooms added yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first room type with photos and pricing
              </p>
              <Button onClick={handleOpenCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Room
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Card key={room.roomType} className="overflow-hidden">
                  <div className="relative h-40">
                    {room.photos.length > 0 ? (
                      <img
                        src={room.photos[0]}
                        alt={room.roomType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <BedDouble className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {room.photos.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{room.photos.length - 1} more
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{room.roomType}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-foreground">
                      ${room.pricePerNight.toString()} / night
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {room.promo && (
                      <Alert className="py-2">
                        <AlertDescription className="text-xs">{room.promo}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleEdit(room)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleDelete(room.roomType)}
                        disabled={deleteRoom.isPending}
                      >
                        {deleteRoom.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Room' : 'Create New Room'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update room details and photos' : 'Add a new room type with photos and pricing'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomType">Room Type / Name *</Label>
              <Input
                id="roomType"
                value={formData.roomType}
                onChange={(e) => setFormData((prev) => ({ ...prev, roomType: e.target.value }))}
                placeholder="e.g., Deluxe Suite, Standard Room"
                required
                disabled={isEdit}
              />
              {isEdit && (
                <p className="text-xs text-muted-foreground">Room type cannot be changed when editing</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerNight">Price per Night *</Label>
              <Input
                id="pricePerNight"
                type="number"
                min="0"
                value={formData.pricePerNight}
                onChange={(e) => setFormData((prev) => ({ ...prev, pricePerNight: e.target.value }))}
                placeholder="Enter price"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo">Promo Text (Optional)</Label>
              <Textarea
                id="promo"
                value={formData.promo}
                onChange={(e) => setFormData((prev) => ({ ...prev, promo: e.target.value }))}
                placeholder="e.g., 20% off for early bookings"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Room Photos *</Label>
              <div className="space-y-3">
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Room photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload images (max 2MB each). You can add multiple photos.
                </p>
                {imageError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRoom.isPending}>
                {updateRoom.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Room' : 'Create Room'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
