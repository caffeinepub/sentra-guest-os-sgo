import { useState, useEffect } from 'react';
import { useGetHotelProfile, useSaveHotelProfile } from '../../hooks/useHotelProfile';
import { HotelClassification, type HotelProfile } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Star, ExternalLink, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

// String-based UI model for classification (stable for Select component)
type ClassificationUIValue = 
  | 'fiveStar'
  | 'fourStar'
  | 'threeStar'
  | 'twoStar'
  | 'oneStar'
  | 'jasmine';

// Mapping helpers between UI strings and backend enum
const classificationToUI = (classification: HotelClassification | undefined): ClassificationUIValue | '' => {
  if (!classification) return '';
  
  switch (classification) {
    case HotelClassification.fiveStar:
      return 'fiveStar';
    case HotelClassification.fourStar:
      return 'fourStar';
    case HotelClassification.threeStar:
      return 'threeStar';
    case HotelClassification.twoStar:
      return 'twoStar';
    case HotelClassification.oneStar:
      return 'oneStar';
    case HotelClassification.jasmine:
      return 'jasmine';
    default:
      return '';
  }
};

const uiToClassification = (uiValue: ClassificationUIValue): HotelClassification => {
  switch (uiValue) {
    case 'fiveStar':
      return HotelClassification.fiveStar;
    case 'fourStar':
      return HotelClassification.fourStar;
    case 'threeStar':
      return HotelClassification.threeStar;
    case 'twoStar':
      return HotelClassification.twoStar;
    case 'oneStar':
      return HotelClassification.oneStar;
    case 'jasmine':
      return HotelClassification.jasmine;
  }
};

const classificationOptions: Array<{ value: ClassificationUIValue; label: string; icon: string }> = [
  { value: 'fiveStar', label: '5-Star Hotel', icon: '⭐⭐⭐⭐⭐' },
  { value: 'fourStar', label: '4-Star Hotel', icon: '⭐⭐⭐⭐' },
  { value: 'threeStar', label: '3-Star Hotel', icon: '⭐⭐⭐' },
  { value: 'twoStar', label: '2-Star Hotel', icon: '⭐⭐' },
  { value: 'oneStar', label: '1-Star Hotel', icon: '⭐' },
  { value: 'jasmine', label: 'Jasmine (Melati)', icon: '🌸' },
];

export default function HotelProfileForm() {
  const { data: hotelProfile, isLoading, isFetched } = useGetHotelProfile();
  const saveProfile = useSaveHotelProfile();

  const [hotelName, setHotelName] = useState('');
  const [classification, setClassification] = useState<ClassificationUIValue | ''>('');
  const [address, setAddress] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [country, setCountry] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoData, setLogoData] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hotelProfile) {
      setHotelName(hotelProfile.name || '');
      // Safely map backend classification to UI string with fallback
      const uiClassification = classificationToUI(hotelProfile.classification);
      setClassification(uiClassification);
      setAddress(hotelProfile.location?.address || '');
      setMapLink(hotelProfile.location?.mapLink || '');
      setCountry(hotelProfile.country || '');
      if (hotelProfile.logo) {
        setLogoPreview(hotelProfile.logo);
        setLogoData(hotelProfile.logo);
      }
    }
  }, [hotelProfile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      setLogoData(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoData(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!hotelName.trim()) {
      newErrors.hotelName = 'Hotel name is required';
    }

    if (!classification) {
      newErrors.classification = 'Hotel classification is required';
    }

    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!address.trim()) {
      newErrors.address = 'Hotel address is required';
    }

    if (!mapLink.trim()) {
      newErrors.mapLink = 'Map link is required';
    } else {
      try {
        const url = new URL(mapLink);
        if (url.protocol !== 'https:') {
          newErrors.mapLink = 'Map link must use HTTPS protocol';
        }
      } catch {
        newErrors.mapLink = 'Please enter a valid URL (e.g., https://maps.google.com/...)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    // Guard against invalid classification value
    if (!classification) {
      toast.error('Please select a hotel classification');
      return;
    }

    try {
      // Safely convert UI string back to backend enum
      const backendClassification = uiToClassification(classification as ClassificationUIValue);
      
      const profileToSave: HotelProfile = {
        name: hotelName.trim(),
        classification: backendClassification,
        location: {
          address: address.trim(),
          mapLink: mapLink.trim(),
        },
        country: country.trim(),
        logo: logoData || undefined,
        rooms: hotelProfile?.rooms || [], // Preserve existing rooms or use empty array
      };

      await saveProfile.mutateAsync(profileToSave);
      toast.success('Hotel profile saved successfully');
    } catch (error) {
      console.error('Failed to save hotel profile:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to save hotel profile: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isProfileComplete = hotelProfile && 
    hotelProfile.name && 
    hotelProfile.classification && 
    hotelProfile.location?.address && 
    hotelProfile.location?.mapLink &&
    hotelProfile.country;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Star className="h-5 w-5 flex-shrink-0" />
          Hotel Profile
        </CardTitle>
        <CardDescription className="text-sm">
          {isProfileComplete 
            ? 'Your hotel profile is complete. You can update it anytime.'
            : 'Complete your hotel profile to help guests find and learn about your property.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isProfileComplete && isFetched && (
          <Alert>
            <AlertDescription className="text-sm">
              Please complete all required fields to finish setting up your hotel profile.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Hotel Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Hotel Logo</Label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {logoPreview ? (
                <div className="relative flex-shrink-0">
                  <img
                    src={logoPreview}
                    alt="Hotel logo preview"
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 flex-shrink-0">
                  <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1 w-full space-y-2">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Upload your hotel logo (max 2MB, JPG, PNG, or GIF)
                </p>
              </div>
            </div>
          </div>

          {/* Hotel Name */}
          <div className="space-y-2">
            <Label htmlFor="hotelName">
              Hotel Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hotelName"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="Enter your hotel name"
              className={errors.hotelName ? 'border-destructive' : ''}
            />
            {errors.hotelName && (
              <p className="text-sm text-destructive">{errors.hotelName}</p>
            )}
          </div>

          {/* Classification */}
          <div className="space-y-2">
            <Label htmlFor="classification">
              Hotel Classification <span className="text-destructive">*</span>
            </Label>
            <Select
              value={classification || undefined}
              onValueChange={(value) => setClassification(value as ClassificationUIValue)}
            >
              <SelectTrigger 
                id="classification"
                className={errors.classification ? 'border-destructive' : ''}
              >
                <SelectValue placeholder="Select hotel classification" />
              </SelectTrigger>
              <SelectContent>
                {classificationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classification && (
              <p className="text-sm text-destructive">{errors.classification}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Enter country (e.g., Indonesia, Malaysia, Singapore)"
              className={errors.country ? 'border-destructive' : ''}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Hotel Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete hotel address"
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          {/* Map Link */}
          <div className="space-y-2">
            <Label htmlFor="mapLink">
              Map Link (Google Maps or similar) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mapLink"
              type="url"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/..."
              className={errors.mapLink ? 'border-destructive' : ''}
            />
            {errors.mapLink && (
              <p className="text-sm text-destructive">{errors.mapLink}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Paste the full URL from Google Maps or another map service
            </p>
          </div>

          {/* Display saved location */}
          {hotelProfile?.location?.mapLink && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-sm text-muted-foreground break-words">{hotelProfile.location.address}</p>
                  <a
                    href={hotelProfile.location.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View on map
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saveProfile.isPending}
          className="w-full"
          size="lg"
        >
          {saveProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Hotel Profile'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
