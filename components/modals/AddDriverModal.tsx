'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Bike,
  FileText,
  Shield,
  Camera,
  Briefcase,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  IdCard,
  Users,
  Car,
} from 'lucide-react';
import { api } from '@/lib/api';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Bacolod Barangays
const BARANGAYS = [
  'Alijis', 'Alangilan', 'Banago', 'Bata', 'Cabug', 'Estefania', 'Felisa',
  'Granada', 'Handumanan', 'Mandalagan', 'Mansilingan', 'Montevista', 'Pahanocoy',
  'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Taculing', 'Tangub', 'Villamonte',
];

const SERVICE_REGIONS = ['Bacolod City', 'Negros Occidental'];
const VEHICLE_TYPES = ['Motorcycle', 'Scooter'];
const TIME_ALLOCATIONS = ['Full-time', 'Part-time', 'Flexible'];
const SEX_OPTIONS = ['Male', 'Female'];
const LICENSE_LEVELS = ['Non-Pro', 'Professional'];
const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'Semi-Automatic'];
const OWNERSHIP_OPTIONS = ['Owned', 'Financed', 'Rented'];

const STEPS = [
  { id: 1, title: 'Service Info', icon: Briefcase },
  { id: 2, title: 'Personal', icon: User },
  { id: 3, title: 'Address', icon: MapPin },
  { id: 4, title: 'License', icon: IdCard },
  { id: 5, title: 'Emergency', icon: Users },
  { id: 6, title: 'Vehicle', icon: Bike },
  { id: 7, title: 'Documents', icon: FileText },
  { id: 8, title: 'Confirm', icon: Check },
];

export function AddDriverModal({ isOpen, onClose, onSuccess }: AddDriverModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Service Info
    serviceRegion: '',
    vehicleType: '',
    timeAllocation: '',
    // Personal Info
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    sex: '',
    phoneNumber: '',
    // Address
    barangay: '',
    city: 'Bacolod City',
    province: 'Negros Occidental',
    // License
    licenseLevel: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelationship: '',
    // Vehicle Info
    plateNumber: '',
    vehicleMaker: '',
    vehicleModel: '',
    vehicleColor: '',
    manufacturedYear: '',
    chassisNumber: '',
    engineNumber: '',
    transmissionType: '',
    vehicleOwnership: '',
    // Government IDs
    tin: '',
    sss: '',
    // Agreements
    dataPrivacyConsent: false,
    backgroundCheckConsent: false,
  });

  // File state
  const [files, setFiles] = useState<{
    profilePhoto?: File;
    licensePhoto?: File;
    vehicleOR?: File;
    vehicleCR?: File;
    vehicleFrontPhoto?: File;
    vehicleBackPhoto?: File;
    vehicleSidePhoto?: File;
    fitToWorkCertificate?: File;
  }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    switch (step) {
      case 1:
        if (!formData.serviceRegion || !formData.vehicleType || !formData.timeAllocation) {
          setError('Please fill in all service information fields');
          return false;
        }
        break;
      case 2:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.dateOfBirth || !formData.sex || !formData.phoneNumber) {
          setError('Please fill in all personal information fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        break;
      case 3:
        if (!formData.barangay) {
          setError('Please select a barangay');
          return false;
        }
        break;
      case 4:
        if (!formData.licenseLevel || !formData.licenseNumber || !formData.licenseExpiryDate) {
          setError('Please fill in all license information');
          return false;
        }
        break;
      case 5:
        if (!formData.emergencyContactName || !formData.emergencyContactNumber || !formData.emergencyContactRelationship) {
          setError('Please fill in all emergency contact information');
          return false;
        }
        break;
      case 6:
        if (!formData.plateNumber || !formData.vehicleMaker || !formData.vehicleModel || !formData.vehicleColor || !formData.manufacturedYear || !formData.chassisNumber || !formData.engineNumber || !formData.transmissionType || !formData.vehicleOwnership) {
          setError('Please fill in all vehicle information');
          return false;
        }
        break;
      case 7:
        // Documents are optional, no validation needed
        break;
      case 8:
        if (!formData.dataPrivacyConsent || !formData.backgroundCheckConsent) {
          setError('Please accept all required agreements');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    setError(null);

    try {
      const submitFormData = new FormData();

      // Add all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          submitFormData.append(key, value.toString());
        } else if (value) {
          submitFormData.append(key, value);
        }
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          submitFormData.append(key, file);
        }
      });

      await api.registerDriver(submitFormData);
      onSuccess?.();
      onClose();
      resetForm();
    } catch (err: unknown) {
      const error = err as { errors?: string[] };
      setError(error.errors?.[0] || 'Failed to register driver');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      serviceRegion: '',
      vehicleType: '',
      timeAllocation: '',
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      sex: '',
      phoneNumber: '',
      barangay: '',
      city: 'Bacolod City',
      province: 'Negros Occidental',
      licenseLevel: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      emergencyContactName: '',
      emergencyContactNumber: '',
      emergencyContactRelationship: '',
      plateNumber: '',
      vehicleMaker: '',
      vehicleModel: '',
      vehicleColor: '',
      manufacturedYear: '',
      chassisNumber: '',
      engineNumber: '',
      transmissionType: '',
      vehicleOwnership: '',
      tin: '',
      sss: '',
      dataPrivacyConsent: false,
      backgroundCheckConsent: false,
    });
    setFiles({});
    setError(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <Briefcase size={20} className="text-[var(--sakay-yellow)]" />
              Service Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Service Region *</label>
                <select name="serviceRegion" value={formData.serviceRegion} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]">
                  <option value="">Select Region</option>
                  {SERVICE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Type *</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]">
                  <option value="">Select Type</option>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Time Allocation *</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_ALLOCATIONS.map(t => (
                    <label key={t} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.timeAllocation === t ? 'border-[var(--sakay-yellow)] bg-[var(--sakay-yellow)]/10' : 'border-[var(--border-color)] hover:border-[var(--sakay-yellow)]/50'}`}>
                      <input type="radio" name="timeAllocation" value={t} checked={formData.timeAllocation === t} onChange={handleInputChange} className="sr-only" />
                      <span className="text-[var(--primary-text)] font-medium text-sm">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <User size={20} className="text-[var(--sakay-yellow)]" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Phone Number *</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="+63 912 345 6789" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Sex *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SEX_OPTIONS.map(s => (
                    <label key={s} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.sex === s ? 'border-[var(--sakay-yellow)] bg-[var(--sakay-yellow)]/10' : 'border-[var(--border-color)] hover:border-[var(--sakay-yellow)]/50'}`}>
                      <input type="radio" name="sex" value={s} checked={formData.sex === s} onChange={handleInputChange} className="sr-only" />
                      <span className="text-[var(--primary-text)] font-medium">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <MapPin size={20} className="text-[var(--sakay-yellow)]" />
              Current Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Barangay *</label>
                <select name="barangay" value={formData.barangay} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]">
                  <option value="">Select Barangay</option>
                  {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">City</label>
                <input type="text" value={formData.city} readOnly className="w-full px-4 py-3 bg-[var(--elevated-surface)] border border-[var(--border-color)] rounded-xl text-[var(--tertiary-text)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Province</label>
                <input type="text" value={formData.province} readOnly className="w-full px-4 py-3 bg-[var(--elevated-surface)] border border-[var(--border-color)] rounded-xl text-[var(--tertiary-text)]" />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <IdCard size={20} className="text-[var(--sakay-yellow)]" />
              Driver&apos;s License
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">License Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {LICENSE_LEVELS.map(l => (
                    <label key={l} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.licenseLevel === l ? 'border-[var(--sakay-yellow)] bg-[var(--sakay-yellow)]/10' : 'border-[var(--border-color)] hover:border-[var(--sakay-yellow)]/50'}`}>
                      <input type="radio" name="licenseLevel" value={l} checked={formData.licenseLevel === l} onChange={handleInputChange} className="sr-only" />
                      <span className="text-[var(--primary-text)] font-medium text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">License Number *</label>
                <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Expiry Date *</label>
                <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">License Photo</label>
                <input type="file" name="licensePhoto" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <Users size={20} className="text-[var(--sakay-yellow)]" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Contact Person Name *</label>
                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Contact Number *</label>
                <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Relationship *</label>
                <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleInputChange} placeholder="e.g., Spouse, Parent, Sibling" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <Bike size={20} className="text-[var(--sakay-yellow)]" />
              Vehicle Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Plate Number *</label>
                <input type="text" name="plateNumber" value={formData.plateNumber} onChange={handleInputChange} placeholder="ABC 1234" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Maker *</label>
                <input type="text" name="vehicleMaker" value={formData.vehicleMaker} onChange={handleInputChange} placeholder="e.g., Honda, Yamaha" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Model *</label>
                <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} placeholder="e.g., TMX 155" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Color *</label>
                <input type="text" name="vehicleColor" value={formData.vehicleColor} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Manufactured Year *</label>
                <input type="text" name="manufacturedYear" value={formData.manufacturedYear} onChange={handleInputChange} placeholder="2023" maxLength={4} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Chassis Number *</label>
                <input type="text" name="chassisNumber" value={formData.chassisNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Engine Number *</label>
                <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Transmission *</label>
                <select name="transmissionType" value={formData.transmissionType} onChange={handleInputChange} className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]">
                  <option value="">Select</option>
                  {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Ownership *</label>
                <div className="grid grid-cols-3 gap-2">
                  {OWNERSHIP_OPTIONS.map(o => (
                    <label key={o} className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.vehicleOwnership === o ? 'border-[var(--sakay-yellow)] bg-[var(--sakay-yellow)]/10' : 'border-[var(--border-color)] hover:border-[var(--sakay-yellow)]/50'}`}>
                      <input type="radio" name="vehicleOwnership" value={o} checked={formData.vehicleOwnership === o} onChange={handleInputChange} className="sr-only" />
                      <span className="text-[var(--primary-text)] font-medium text-sm">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <FileText size={20} className="text-[var(--sakay-yellow)]" />
              Documents & Photos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">
                  <Camera size={14} className="inline mr-1" />
                  Profile Photo
                </label>
                <input type="file" name="profilePhoto" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Official Receipt (OR)</label>
                <input type="file" name="vehicleOR" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Certificate of Registration (CR)</label>
                <input type="file" name="vehicleCR" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Front Photo</label>
                <input type="file" name="vehicleFrontPhoto" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Back Photo</label>
                <input type="file" name="vehicleBackPhoto" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">Vehicle Side Photo</label>
                <input type="file" name="vehicleSidePhoto" onChange={handleFileChange} accept="image/*" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--sakay-yellow)] file:text-[var(--dark-background)] file:font-medium file:cursor-pointer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">TIN Number</label>
                <input type="text" name="tin" value={formData.tin} onChange={handleInputChange} placeholder="000-000-000-000" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--secondary-text)] mb-2">SSS Number</label>
                <input type="text" name="sss" value={formData.sss} onChange={handleInputChange} placeholder="00-0000000-0" className="w-full px-4 py-3 bg-[var(--input-background)] border border-[var(--border-color)] rounded-xl text-[var(--primary-text)] focus:outline-none focus:border-[var(--sakay-yellow)]" />
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--primary-text)] flex items-center gap-2">
              <Shield size={20} className="text-[var(--sakay-yellow)]" />
              Agreements & Confirmation
            </h3>
            <div className="space-y-4">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.dataPrivacyConsent ? 'border-[var(--sakay-yellow)] bg-[var(--sakay-yellow)]/10' : 'border-[var(--border-color)] hover:border-[var(--sakay-yellow)]/50'}`}>
                <input type="checkbox" name="dataPrivacyConsent" checked={formData.dataPrivacyConsent} onChange={handleInputChange} className="mt-1 w-5 h-5 accent-[var(--sakay-yellow)]" />
                <span className="text-[var(--primary-text)] text-sm">I agree to the Data Privacy Act and consent to the collection and processing of my personal data. *</span>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.backgroundCheckConsent ? 'border-[var(--sakay-yellow)] bg-[var(--sakay-yellow)]/10' : 'border-[var(--border-color)] hover:border-[var(--sakay-yellow)]/50'}`}>
                <input type="checkbox" name="backgroundCheckConsent" checked={formData.backgroundCheckConsent} onChange={handleInputChange} className="mt-1 w-5 h-5 accent-[var(--sakay-yellow)]" />
                <span className="text-[var(--primary-text)] text-sm">I consent to Sakay.to performing a background check as part of the verification process. *</span>
              </label>
              {/* Summary */}
              <div className="mt-6 p-4 bg-[var(--elevated-surface)] rounded-xl">
                <h4 className="font-semibold text-[var(--primary-text)] mb-2">Registration Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-[var(--tertiary-text)]">Name:</p>
                  <p className="text-[var(--primary-text)]">{formData.firstName} {formData.lastName}</p>
                  <p className="text-[var(--tertiary-text)]">Email:</p>
                  <p className="text-[var(--primary-text)]">{formData.email}</p>
                  <p className="text-[var(--tertiary-text)]">Vehicle:</p>
                  <p className="text-[var(--primary-text)]">{formData.vehicleMaker} {formData.vehicleModel}</p>
                  <p className="text-[var(--tertiary-text)]">Plate:</p>
                  <p className="text-[var(--primary-text)]">{formData.plateNumber}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
            <div>
              <h2 className="text-xl font-bold text-[var(--primary-text)]">Add New Driver</h2>
              <p className="text-sm text-[var(--tertiary-text)]">Step {currentStep} of {STEPS.length}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-[var(--elevated-surface)] rounded-lg transition-colors"
            >
              <X size={20} className="text-[var(--tertiary-text)]" />
            </motion.button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-[var(--border-color)] overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${isActive ? 'bg-[var(--sakay-yellow)] text-[var(--dark-background)]' : isCompleted ? 'bg-[var(--success-green)]/20 text-[var(--success-green)]' : 'text-[var(--tertiary-text)]'}`}>
                      <Icon size={14} />
                      <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <ChevronRight size={14} className="text-[var(--tertiary-text)] mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-[var(--error-red)]/10 border border-[var(--error-red)]/30 rounded-xl flex items-center gap-2 text-[var(--error-red)]"
              >
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[var(--border-color)]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--elevated-surface)] text-[var(--secondary-text)] rounded-xl hover:bg-[var(--input-background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
              Previous
            </motion.button>
            {currentStep < STEPS.length ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl hover:bg-[var(--bright-yellow)] transition-colors"
              >
                Next
                <ChevronRight size={18} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-[var(--sakay-yellow)] text-[var(--dark-background)] font-semibold rounded-xl hover:bg-[var(--bright-yellow)] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Submit Application
                  </>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
