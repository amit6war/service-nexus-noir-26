
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Star,
  Wrench,
  Scissors,
  Car,
  Home,
  Paintbrush,
  Users
} from 'lucide-react';
import Step1 from './Step1';
import Step2 from './Step2';
import ConfirmationPage from './ConfirmationPage';
import ProgressIndicator from './ProgressIndicator';

interface FormData {
  accountType: 'customer' | 'provider' | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  password?: string;
  confirmPassword?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  bio: string;
  businessName?: string;
  experience?: string;
  services: string[];
  hourlyRate?: string;
  emergencyServices?: boolean;
  termsAccepted: boolean;
}

const initialFormData: FormData = {
  accountType: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  bio: '',
  services: [],
  termsAccepted: false,
};

const serviceCategories = [
  {
    name: 'Home Repair',
    icon: Home,
    subcategories: ['Plumbing', 'Electrical', 'Carpentry', 'Painting']
  },
  {
    name: 'Automotive',
    icon: Car,
    subcategories: ['Mechanic', 'Detailing', 'Towing']
  },
  {
    name: 'Beauty & Personal Care',
    icon: Scissors,
    subcategories: ['Hair Styling', 'Makeup', 'Nail Care']
  },
  {
    name: 'Handyman Services',
    icon: Wrench,
    subcategories: ['General Repairs', 'Installation', 'Assembly']
  },
  {
    name: 'Cleaning Services',
    icon: Paintbrush,
    subcategories: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning']
  },
  {
    name: 'Pet Care',
    icon: Star,
    subcategories: ['Grooming', 'Walking', 'Sitting']
  },
  {
    name: 'Tutoring',
    icon: Users,
    subcategories: ['Math', 'Science', 'English']
  },
  {
    name: 'Event Planning',
    icon: Calendar,
    subcategories: ['Catering', 'Decor', 'Music']
  }
];

interface SignupWizardProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const SignupWizard = ({ onBack, onSuccess }: SignupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = currentStep === 1 ? 20 : 
                   currentStep === 2 ? 40 : 
                   currentStep === 3 ? 60 :
                   currentStep === 4 ? 80 : 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    
    if (type === 'checkbox') {
      const checked = (target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      let newServices = [...prev.services];
      if (checked) {
        newServices.push(value);
      } else {
        newServices = newServices.filter(service => service !== value);
      }
      return { ...prev, services: newServices };
    });
  };

  const handleAccountTypeNext = () => {
    if (!formData.accountType) {
      toast({
        title: "Selection Required",
        description: "Please select an account type to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handlePersonalInfoNext = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.accountType === 'provider' && (!formData.businessName || !formData.experience || formData.services.length === 0)) {
      toast({
        title: "Provider Information Required",
        description: "Please complete all provider information fields.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(3);
  };

  const handleLocationNext = () => {
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Address Required",
        description: "Please complete your address information.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Signup Failed",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // Create profile with proper role typing
      const profileData = {
        id: authData.user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: formData.accountType === 'provider' ? 'customer' as const : 'customer' as const, // Use 'customer' as default, will be updated to 'provider' after verification
        address_line_1: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zipCode,
        country: formData.country,
        avatar_url: null,
        address_line_2: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: "Profile Creation Failed",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // If provider, create provider profile
      if (formData.accountType === 'provider') {
        const providerData = {
          user_id: authData.user.id,
          business_name: formData.businessName!,
          description: formData.bio || '',
          years_experience: parseInt(formData.experience!) || 0,
          verification_status: 'pending' as const,
          rating: 0,
          total_reviews: 0,
          emergency_passes: 3,
          is_active: true,
          business_address: formData.address,
          business_phone: formData.phone,
          business_email: formData.email,
          portfolio_images: [],
        };

        const { error: providerError } = await supabase
          .from('provider_profiles')
          .insert(providerData);

        if (providerError) {
          console.error('Provider profile creation error:', providerError);
          toast({
            title: "Provider Profile Creation Failed",
            description: providerError.message,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Account Created Successfully!",
        description: "Please check your email to verify your account.",
      });

      setCurrentStep(5);
      onSuccess?.();
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal/5 to-blue/5 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2 pt-6">
            <CardTitle className="text-3xl font-bold text-center">
              Create Your Account
            </CardTitle>
            <ProgressIndicator currentStep={currentStep} totalSteps={5} />
          </CardHeader>
          <CardContent className="p-8">
            <Progress value={progress} className="mb-4 h-2" />
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <Step1 
                  formData={{
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password || ''
                  }}
                  selectedRole={formData.accountType === 'provider' ? 'provider' : 'customer'}
                  showPassword={false}
                  onInputChange={handleChange}
                  onRoleChange={(role) => setFormData(prev => ({ ...prev, accountType: role }))}
                  onTogglePassword={() => {}}
                />
              )}
              {currentStep === 2 && (
                <Step2
                  formData={{
                    fullName: `${formData.firstName} ${formData.lastName}`,
                    gender: '',
                    location: `${formData.city}, ${formData.state}`
                  }}
                  handleChange={handleChange}
                  handleServiceChange={handleServiceChange}
                  serviceCategories={serviceCategories}
                  handleNext={handlePersonalInfoNext}
                  handleBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          type="text" 
                          id="address" 
                          name="address" 
                          value={formData.address} 
                          onChange={handleChange} 
                          placeholder="123 Main St"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          type="text" 
                          id="city" 
                          name="city" 
                          value={formData.city} 
                          onChange={handleChange} 
                          placeholder="Anytown"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input 
                          type="text" 
                          id="state" 
                          name="state" 
                          value={formData.state} 
                          onChange={handleChange} 
                          placeholder="CA"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input 
                          type="text" 
                          id="zipCode" 
                          name="zipCode" 
                          value={formData.zipCode} 
                          onChange={handleChange} 
                          placeholder="90210"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        type="text" 
                        id="country" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleChange} 
                        placeholder="US"
                        disabled
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handleLocationNext}>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        type="password" 
                        id="password" 
                        name="password" 
                        onChange={handleChange} 
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        onChange={handleChange} 
                        placeholder="Confirm password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us a little about yourself"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        name="termsAccepted" 
                        checked={formData.termsAccepted} 
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, termsAccepted: !!checked }))
                        }
                      />
                      <Label htmlFor="terms">I agree to the terms and conditions</Label>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(3)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button disabled={isSubmitting} onClick={handleSubmit}>
                        {isSubmitting ? "Submitting..." : "Create Account"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              {currentStep === 5 && (
                <ConfirmationPage 
                  type="success"
                  onBackToHome={() => navigate('/')}
                  onContinueToSignIn={() => navigate('/auth')}
                  onResendConfirmation={() => {}}
                  email={formData.email}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupWizard;
