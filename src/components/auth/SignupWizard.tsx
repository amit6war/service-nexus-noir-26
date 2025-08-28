
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Mail,
  Phone,
  Lock,
  ArrowRight, 
  ArrowLeft,
  Upload,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

interface FormData {
  accountType: 'customer' | 'provider' | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  idProofFile?: File | null;
}

const initialFormData: FormData = {
  accountType: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
  idProofFile: null,
};

interface SignupWizardProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const SignupWizard = ({ onBack, onSuccess }: SignupWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();

  const progress = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
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

  const handlePersonalInfoNext = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Only require ID proof for service providers, no license file needed during signup
    if (formData.accountType === 'provider' && !formData.idProofFile) {
      toast({
        title: "Document Required",
        description: "Please upload ID proof document.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Password Required",
        description: "Please enter and confirm your password.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
      };

      const { error } = await signUp(
        formData.email, 
        formData.password, 
        userData, 
        formData.accountType || 'customer'
      );

      if (!error) {
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account.",
        });
        onSuccess?.();
      }
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
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/90 to-teal/20 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4 pt-8">
            <CardTitle className="text-3xl font-bold text-center text-foreground">
              Join Service N-B
            </CardTitle>
            <div className="text-center text-muted-foreground">
              Step {currentStep} of 3
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Progress value={progress} className="mb-8 h-2" />
            
            <AnimatePresence mode="wait">
              {/* Step 1: Account Type Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Choose Your Account Type</h3>
                    <p className="text-muted-foreground">Are you looking for services or providing them?</p>
                  </div>

                  <RadioGroup
                    value={formData.accountType || ''}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value as 'customer' | 'provider' }))}
                    className="grid gap-4"
                  >
                    <motion.label 
                      htmlFor="role-customer" 
                      className="flex items-center gap-4 rounded-xl border-2 border-border bg-card/50 px-6 py-4 cursor-pointer hover:bg-card transition-all duration-300 hover:border-teal/50 hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RadioGroupItem id="role-customer" value="customer" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-teal" />
                          <span className="font-semibold text-foreground">Customer</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Find and book trusted services</p>
                      </div>
                    </motion.label>

                    <motion.label 
                      htmlFor="role-provider" 
                      className="flex items-center gap-4 rounded-xl border-2 border-border bg-card/50 px-6 py-4 cursor-pointer hover:bg-card transition-all duration-300 hover:border-teal/50 hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <RadioGroupItem id="role-provider" value="provider" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-teal" />
                          <span className="font-semibold text-foreground">Service Provider</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Offer your professional services</p>
                      </div>
                    </motion.label>
                  </RadioGroup>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={onBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handleAccountTypeNext} className="bg-teal hover:bg-teal/90">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Personal Information</h3>
                    <p className="text-muted-foreground">Tell us about yourself</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        type="text" 
                        id="firstName" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        placeholder="Enter first name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        type="text" 
                        id="lastName" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        placeholder="Enter last name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* File uploads for service providers - only ID proof required */}
                  {formData.accountType === 'provider' && (
                    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4 text-teal" />
                        Required Document
                      </h4>
                      
                      <div>
                        <Label htmlFor="idProof">ID Proof (Government Issued) *</Label>
                        <Input
                          type="file"
                          id="idProof"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(e, 'idProofFile')}
                          className="mt-1"
                        />
                        {formData.idProofFile && (
                          <p className="text-xs text-teal mt-1">✓ {formData.idProofFile.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Note: Professional licenses can be uploaded later from your provider dashboard
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={handlePersonalInfoNext} className="bg-teal hover:bg-teal/90">
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Password and Terms */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold text-foreground mb-2">Create Your Password</h3>
                    <p className="text-muted-foreground">Secure your account</p>
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="pl-10 pr-12 mt-1"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-teal transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="pl-10 pr-12 mt-1"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-teal transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the <span className="text-teal hover:underline cursor-pointer">Terms and Conditions</span>
                    </Label>
                  </div>

                  <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button disabled={isSubmitting} onClick={handleSubmit} className="bg-teal hover:bg-teal/90">
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupWizard;
