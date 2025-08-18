
import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Loader, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Step2Props {
  formData: {
    fullName: string;
    gender: string;
    location: string;
  };
  selectedRole: 'customer' | 'provider';
  locating: boolean;
  licenseFile: File | null;
  idFile: File | null;
  additionalFile: File | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenderChange: (gender: string) => void;
  onUseCurrentLocation: () => void;
  onLicenseFileChange: (file: File | null) => void;
  onIdFileChange: (file: File | null) => void;
  onAdditionalFileChange: (file: File | null) => void;
}

const Step2 = ({
  formData,
  selectedRole,
  locating,
  licenseFile,
  idFile,
  additionalFile,
  onInputChange,
  onGenderChange,
  onUseCurrentLocation,
  onLicenseFileChange,
  onIdFileChange,
  onAdditionalFileChange,
}: Step2Props) => {
  const [documentsOpen, setDocumentsOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
        <p className="text-sm text-muted-foreground">Tell us a bit about yourself</p>
      </div>

      <div className="space-y-6">
        {/* Personal Details Section */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-teal" />
            Personal Details
          </h4>
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={onInputChange}
                placeholder="Enter your full name"
                className="input-dark w-full pl-10 transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-2">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={(e) => onGenderChange(e.target.value)}
              className="input-dark w-full transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg shadow-sm"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal" />
            Location
          </h4>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Your Location *
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={onInputChange}
                  placeholder="Enter your city or address"
                  className="input-dark w-full pl-10 transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg shadow-sm"
                  required
                />
              </div>
              <motion.button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={locating}
                className="btn-ghost text-xs px-3 py-2 whitespace-nowrap disabled:opacity-50 flex items-center gap-1 transition-all duration-300 rounded-lg"
                whileHover={{ scale: locating ? 1 : 1.05 }}
                whileTap={{ scale: locating ? 1 : 0.95 }}
              >
                {locating ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  'Use Current Location'
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Verification Documents Section - Only for Service Providers */}
        {selectedRole === 'provider' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="bg-secondary/30 rounded-xl overflow-hidden shadow-sm"
          >
            <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
              <CollapsibleTrigger className="w-full p-4 text-left hover:bg-secondary/20 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal" />
                    Verification Documents *
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {licenseFile && idFile ? '✓ Required files uploaded' : 'Click to upload required files'}
                    </span>
                    {documentsOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 pb-4 space-y-4 border-t border-border/50"
                >
                  <p className="text-xs text-muted-foreground pt-4">
                    Upload required documents for verification. All files will be reviewed by our admin team.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Valid License (Image or PDF) *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => onLicenseFileChange(e.target.files?.[0] || null)}
                        className="input-dark w-full text-sm rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal file:text-white hover:file:bg-teal/90"
                        required
                      />
                      {licenseFile && (
                        <p className="text-xs text-teal mt-2 flex items-center gap-1">
                          ✓ {licenseFile.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Government-issued ID (Image or PDF) *
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => onIdFileChange(e.target.files?.[0] || null)}
                        className="input-dark w-full text-sm rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal file:text-white hover:file:bg-teal/90"
                        required
                      />
                      {idFile && (
                        <p className="text-xs text-teal mt-2 flex items-center gap-1">
                          ✓ {idFile.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Additional Certification (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => onAdditionalFileChange(e.target.files?.[0] || null)}
                        className="input-dark w-full text-sm rounded-lg shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal file:text-white hover:file:bg-teal/90"
                      />
                      {additionalFile && (
                        <p className="text-xs text-teal mt-2 flex items-center gap-1">
                          ✓ {additionalFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Step2;
