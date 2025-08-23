
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ProgressIndicator from './ProgressIndicator';
import Step1 from './Step1';
import Step2 from './Step2';

interface SignupWizardProps {
  onBack: () => void;
  onSuccess: () => void;
}

const SignupWizard = ({ onBack, onSuccess }: SignupWizardProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [locating, setLocating] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    location: ''
  });
  
  const [selectedRole, setSelectedRole] = useState<'customer' | 'provider'>('customer');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [additionalFile, setAdditionalFile] = useState<File | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Check for duplicate email or phone
  const checkDuplicates = async (email: string, phone: string) => {
    try {
      const { data: existingProfiles, error } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone.eq.${phone}`);

      if (error) {
        console.error('Error checking duplicates:', error);
        return false;
      }

      // Check if phone exists in profiles
      if (existingProfiles && existingProfiles.length > 0) {
        toast({
          title: "Account Already Exists",
          description: "This phone number is already registered. Please use a different one or sign in.",
          variant: "destructive",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  };

  // Use local geocoding server for reverse geocoding with Google Maps API
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch('http://localhost:3001/reverse-geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reverse geocoding error:', errorData);
        throw new Error(errorData.error || 'Failed to reverse geocode');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // Fallback to coordinates if API fails
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: { latitude, longitude },
        components: {},
        isComplete: false
      };
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ 
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive' 
      });
      return;
    }
    
    setLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        console.log("Accuracy (meters):", accuracy);
        
        try {
          console.log('Calling reverse geocode with coordinates:', latitude, longitude);
          const addressData = await reverseGeocode(latitude, longitude);
          console.log('Address data received:', addressData);
          
          setFormData(prev => ({ 
            ...prev, 
            location: addressData.formattedAddress 
          }));
          setLocating(false);
          
          toast({ 
            title: 'Location detected',
            description: `Address: ${addressData.formattedAddress} (±${accuracy.toFixed(0)}m accuracy)`
          });
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setFormData(prev => ({ 
            ...prev, 
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          }));
          setLocating(false);
          toast({ 
            title: 'Location detected',
            description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(0)}m). Address lookup failed.`
          });
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocating(false);
        let errorMessage = 'Unable to get your current location. Please enter it manually.';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please enable location permission and try again.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable. Please check your GPS and internet connection.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        
        toast({ 
          title: 'Location error',
          description: errorMessage,
          variant: 'destructive' 
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const uploadFile = async (file: File, folder: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verification_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return filePath;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const validateStep1 = async () => {
    if (!formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    // Basic password validation
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicates
    const hasDuplicates = await checkDuplicates(formData.email, formData.phone);
    if (hasDuplicates) {
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.fullName || !formData.gender || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    // Validate required documents for service providers
    if (selectedRole === 'provider') {
      if (!licenseFile || !idFile) {
        toast({
          title: "Required Documents Missing",
          description: "Service providers must upload both a valid license and government-issued ID.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (currentStep === 1 && await validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setIsSubmitting(true);

    try {
      // Extract first and last name from full name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userData = {
        first_name: firstName,
        last_name: lastName,
        phone: formData.phone,
        gender: formData.gender,
        location: formData.location
      };

      console.log('[SignupWizard] Starting signup with role:', selectedRole);

      // Pass the selected role to signUp
      const { error } = await signUp(formData.email, formData.password, userData, selectedRole);
      
      if (error) {
        console.error('[SignupWizard] Signup error:', error);
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Please log in or use a different email.",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('[SignupWizard] Signup successful');

      // Handle post-signup operations for service providers
      if (selectedRole === 'provider') {
        console.log('[SignupWizard] Processing provider documents...');
        
        // Wait a moment for the user to be created
        setTimeout(async () => {
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              console.log('[SignupWizard] Updating provider profile...');
              
              // Update profile role to pending_provider
              await supabase
                .from('profiles')
                .update({ role: 'pending_provider' })
                .eq('id', currentUser.id);

              // Upload documents if provided
              const documents = [];
              
              if (licenseFile) {
                const licensePath = await uploadFile(licenseFile, 'licenses');
                documents.push({
                  user_id: currentUser.id,
                  document_type: 'license',
                  file_path: licensePath,
                  status: 'pending'
                });
              }

              if (idFile) {
                const idPath = await uploadFile(idFile, 'ids');
                documents.push({
                  user_id: currentUser.id,
                  document_type: 'id',
                  file_path: idPath,
                  status: 'pending'
                });
              }

              if (additionalFile) {
                const additionalPath = await uploadFile(additionalFile, 'additional');
                documents.push({
                  user_id: currentUser.id,
                  document_type: 'additional',
                  file_path: additionalPath,
                  status: 'pending'
                });
              }

              // Insert verification documents
              if (documents.length > 0) {
                await supabase
                  .from('verification_documents')
                  .insert(documents);
              }

              toast({
                title: "Service Provider Registration Submitted",
                description: "Your application is under review. You'll receive an email once approved.",
              });
            }
          } catch (uploadError) {
            console.error('Post-signup error:', uploadError);
            toast({
              title: "Registration Completed",
              description: "Account created but there was an issue with document upload. Please try uploading documents after login.",
              variant: "destructive",
            });
          }
        }, 2000);
      } else {
        toast({
          title: "Account Created Successfully",
          description: "Please check your email to verify your account before signing in.",
        });
      }
        
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 60) {
      if (deltaX < 0 && currentStep === 1) {
        handleNext();
      } else if (deltaX > 0 && currentStep === 2) {
        handlePrevious();
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="w-full max-w-md">
      <ProgressIndicator currentStep={currentStep} totalSteps={2} />

      <motion.div 
        className="card-glass min-h-[500px] shadow-xl"
        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
        transition={{ duration: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <Step1
                  key="step1"
                  formData={formData}
                  selectedRole={selectedRole}
                  showPassword={showPassword}
                  onInputChange={handleInputChange}
                  onRoleChange={setSelectedRole}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />
              ) : (
                <Step2
                  key="step2"
                  formData={formData}
                  selectedRole={selectedRole}
                  locating={locating}
                  licenseFile={licenseFile}
                  idFile={idFile}
                  additionalFile={additionalFile}
                  onInputChange={handleInputChange}
                  onGenderChange={(gender) => setFormData({ ...formData, gender })}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onLicenseFileChange={setLicenseFile}
                  onIdFileChange={setIdFile}
                  onAdditionalFileChange={setAdditionalFile}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <motion.button
              type="button"
              onClick={currentStep === 1 ? onBack : handlePrevious}
              className="btn-ghost flex items-center gap-2 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Back' : 'Previous'}
            </motion.button>

            {currentStep === 1 ? (
              <motion.button
                type="button"
                onClick={handleNext}
                className="btn-hero flex items-center gap-2 rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="btn-hero disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 rounded-lg shadow-lg"
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
                Create Account
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupWizard;
