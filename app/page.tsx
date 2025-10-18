'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, CheckCircle, Upload, Users, Loader2, AlertCircle } from 'lucide-react';

// Type definitions
interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  occupation: string;
  education: string;
  phoneNumber: string;
  email: string;
  preferredContact: string;
  twitterHandle: string;
  otherSocial: string;
  whyJoin: string;
  areasOfInterest: string[];
  skills: string;
  availability: string[];
  agreeMembership: boolean;
  agreeDataPrivacy: boolean;
  signature: string;
  signatureDate: string;
  uploadedFile: File | null;
}

type FormDataKey = keyof FormData;

const MembershipApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    occupation: '',
    education: '',
    phoneNumber: '',
    email: '',
    preferredContact: '',
    twitterHandle: '',
    otherSocial: '',
    whyJoin: '',
    areasOfInterest: [],
    skills: '',
    availability: [],
    agreeMembership: false,
    agreeDataPrivacy: false,
    signature: '',
    signatureDate: '',
    uploadedFile: null
  });

  const updateFormData = <K extends FormDataKey>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleCheckboxGroup = (field: 'areasOfInterest' | 'availability', value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item: string) => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      // 'application/pdf',
      // 'application/msword',
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('File must be Image (JPG/PNG)');
      return;
    }

    setUploadingFile(true);
    setError('');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();
      
      if (data.success) {
        setUploadedFileUrl(data.fileUrl);
        updateFormData('uploadedFile', file);
        setError('');
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const validateForm = (): boolean => {
    // Check required fields
    const requiredFields: Partial<Record<FormDataKey, string>> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      address: 'Address',
      phoneNumber: 'Phone Number',
      email: 'Email Address',
      preferredContact: 'Preferred Contact Method',
      whyJoin: 'Why you want to join',
      signature: 'Signature',
      signatureDate: 'Signature Date'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData[field as FormDataKey];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        setError(`${label} is required`);
        return false;
      }
    }

    // Validate age (15-35)
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    if (age < 15 || age > 35) {
      setError('Age must be between 15 and 35 years old');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate phone
    if (formData.phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Check areas of interest
    if (formData.areasOfInterest.length === 0) {
      setError('Please select at least one area of interest');
      return false;
    }

    // Check availability
    if (formData.availability.length === 0) {
      setError('Please select at least one availability option');
      return false;
    }

    // Check consents
    if (!formData.agreeMembership) {
      setError('You must agree to the membership commitment');
      return false;
    }

    if (!formData.agreeDataPrivacy) {
      setError('You must consent to data privacy policy');
      return false;
    }

    // Validate word count for "Why Join" (100-200 words)
    const wordCount = formData.whyJoin.trim().split(/\s+/).length;
    if (wordCount < 100 || wordCount > 200) {
      setError(`"Why do you want to join?" must be 100-200 words (currently ${wordCount} words)`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        fileUrl: uploadedFileUrl,
        areasOfInterest: formData.areasOfInterest,
        availability: formData.availability,
      };

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        setError('');
      } else {
        setError(result.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setError('Failed to submit form. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Users className="w-20 h-20 mx-auto text-sky-500 mb-4" />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              AMAOGBU Youth Stakeholders
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Empowering Young Leaders, Building Stronger Communities
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Be part of a dynamic network of youth stakeholders aged 15-35, 
              dedicated to community development, innovation, and positive change 
              in AMAOGBU. Together, we create opportunities, drive progress, and 
              make a lasting impact.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-sky-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Connect</h3>
                <p className="text-sm text-gray-600">
                  Network with like-minded youth leaders and changemakers
                </p>
              </div>
              <div className="p-4 bg-sky-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Contribute</h3>
                <p className="text-sm text-gray-600">
                  Participate in community projects and development initiatives
                </p>
              </div>
              <div className="p-4 bg-sky-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Grow</h3>
                <p className="text-sm text-gray-600">
                  Access training, resources, and opportunities for personal development
                </p>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep(1)}
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 text-lg rounded-lg shadow-lg transition-all"
            >
              Start Your Membership Application
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            Questions? Contact us at amaogbuyouthsinfo@gmail.com
          </p>
        </div>
      </div>
    </div>
  );

  const Step1PersonalInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) => updateFormData('middleName', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth * (Age 15-35)</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          required
          className="mt-1"
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
          min={new Date(new Date().setFullYear(new Date().getFullYear() - 35)).toISOString().split('T')[0]}
        />
      </div>

      <div>
        <Label>Gender *</Label>
        <RadioGroup value={formData.gender} onValueChange={(val) => updateFormData('gender', val)} className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => updateFormData('address', e.target.value)}
          required
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="occupation">Occupation/Profession</Label>
        <Input
          id="occupation"
          value={formData.occupation}
          onChange={(e) => updateFormData('occupation', e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="education">Educational Background</Label>
        <select
          id="education"
          value={formData.education}
          onChange={(e) => updateFormData('education', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
        >
          <option value="">Select...</option>
          <option value="high-school">High School</option>
          <option value="diploma">Diploma</option>
          <option value="bachelor">Bachelor's Degree</option>
          <option value="postgraduate">Postgraduate</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );

  const Step2ContactInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h2>
      
      <div>
        <Label htmlFor="phoneNumber">Phone Number * (+234-XXX-XXX-XXXX)</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => updateFormData('phoneNumber', e.target.value)}
          placeholder="+234-XXX-XXX-XXXX"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Preferred Contact Method *</Label>
        <RadioGroup value={formData.preferredContact} onValueChange={(val) => updateFormData('preferredContact', val)} className="mt-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="phone" />
            <Label htmlFor="phone">Phone Call</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sms" id="sms" />
            <Label htmlFor="sms">SMS/WhatsApp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="emailContact" />
            <Label htmlFor="emailContact">Email</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="twitterHandle">X (Twitter) Handle (optional)</Label>
        <Input
          id="twitterHandle"
          value={formData.twitterHandle}
          onChange={(e) => updateFormData('twitterHandle', e.target.value)}
          placeholder="@username"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="otherSocial">Other Social Media (Instagram, LinkedIn, etc.)</Label>
        <Input
          id="otherSocial"
          value={formData.otherSocial}
          onChange={(e) => updateFormData('otherSocial', e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );

  const Step3MembershipDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Membership Details</h2>
      
      <div>
        <Label htmlFor="whyJoin">Why do you want to join? * (100-200 words)</Label>
        <Textarea
          id="whyJoin"
          value={formData.whyJoin}
          onChange={(e) => updateFormData('whyJoin', e.target.value)}
          rows={5}
          required
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Word count: {formData.whyJoin.trim() ? formData.whyJoin.trim().split(/\s+/).length : 0} words
        </p>
      </div>

      <div>
        <Label>Areas of Interest * (select all that apply)</Label>
        <div className="space-y-2 mt-2">
          {[
            'Community Development',
            'Education and Skills Training',
            'Entrepreneurship and Innovation',
            'Youth Empowerment Programs',
            'Environmental Sustainability',
            'Sports and Recreation'
          ].map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={formData.areasOfInterest.includes(interest)}
                onCheckedChange={() => handleCheckboxGroup('areasOfInterest', interest)}
              />
              <Label htmlFor={interest}>{interest}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills or Expertise (e.g., leadership, project management)</Label>
        <Textarea
          id="skills"
          value={formData.skills}
          onChange={(e) => updateFormData('skills', e.target.value)}
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Availability for Activities *</Label>
        <div className="space-y-2 mt-2">
          {['Weekdays', 'Weekends', 'Evenings', 'Flexible'].map((availability) => (
            <div key={availability} className="flex items-center space-x-2">
              <Checkbox
                id={availability}
                checked={formData.availability.includes(availability)}
                onCheckedChange={() => handleCheckboxGroup('availability', availability)}
              />
              <Label htmlFor={availability}>{availability}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Step4ConsentAndUpload = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Consent, Agreement & Documents</h2>
      
      <div className="p-4 bg-sky-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeMembership"
            checked={formData.agreeMembership}
            onCheckedChange={(checked) => updateFormData('agreeMembership', checked === true)}
            required
          />
          <Label htmlFor="agreeMembership" className="text-sm">
            <strong>Membership Commitment *:</strong> I agree to abide by the rules, values, 
            and objectives of the AMAOGBU Youth Stakeholders. I understand that membership 
            may involve active participation in meetings, events, and community projects.
          </Label>
        </div>
      </div>

      <div className="p-4 bg-sky-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeDataPrivacy"
            checked={formData.agreeDataPrivacy}
            onCheckedChange={(checked) => updateFormData('agreeDataPrivacy', checked === true)}
            required
          />
          <Label htmlFor="agreeDataPrivacy" className="text-sm">
            <strong>Data Privacy Consent *:</strong> I consent to the collection and use of 
            my personal information for membership management, communication, and event planning. 
            My information will not be shared with third parties without my consent.
          </Label>
        </div>
      </div>

      <div>
        <Label htmlFor="signature">Digital Signature *</Label>
        <Input
          id="signature"
          value={formData.signature}
          onChange={(e) => updateFormData('signature', e.target.value)}
          placeholder="Type your full name as signature"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="signatureDate">Date *</Label>
        <Input
          id="signatureDate"
          type="date"
          value={formData.signatureDate}
          onChange={(e) => updateFormData('signatureDate', e.target.value)}
          required
          className="mt-1"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <Label htmlFor="fileUpload">Upload Supporting Document (optional)</Label>
        <div className="mt-2 flex items-center justify-center w-full">
          <label htmlFor="fileUpload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploadingFile ? (
                <>
                  <Loader2 className="w-8 h-8 mb-2 text-sky-500 animate-spin" />
                  <p className="text-sm text-gray-500">Uploading to Google Drive...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, or Image (MAX. 5MB)</p>
                </>
              )}
            </div>
            <input 
              id="fileUpload" 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={uploadingFile}
            />
          </label>
        </div>
        {formData.uploadedFile && uploadedFileUrl && (
          <div className="mt-2 p-3 bg-green-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700">
                File uploaded: {formData.uploadedFile.name}
              </p>
            </div>
            <a 
              href={uploadedFileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-sky-600 hover:underline"
            >
              View
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const SuccessPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl text-center">
        <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to AMAOGBU Youth Stakeholders!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Your membership application has been successfully submitted and saved to our records. 
          We're excited to have you join our community of young leaders and changemakers!
        </p>
        <div className="p-4 bg-sky-50 rounded-lg mb-6">
          <p className="text-sm text-gray-700">
            Your application will be reviewed within 7-14 days, and you'll receive a 
            confirmation email at <strong>{formData.email}</strong>
          </p>
        </div>
        <div className="space-y-3">
          <Button
            onClick={() => {
              const whatsappMessage = encodeURIComponent(
                `Hello! I'm ${formData.firstName} ${formData.lastName}, and I've just completed my membership registration for AMAOGBU Youth Stakeholders. Looking forward to contributing to our community!`
              );
              const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || 'https://wa.me/';
              window.open(`${whatsappLink}?text=${whatsappMessage}`, '_blank');
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg rounded-lg w-full"
          >
            Join Our WhatsApp Community
          </Button>
          <p className="text-xs text-gray-500">
            Click above to join our WhatsApp group and connect with other members
          </p>
        </div>
      </div>
    </div>
  );

  const steps = [
    { title: 'Personal Info', component: Step1PersonalInfo },
    { title: 'Contact Info', component: Step2ContactInfo },
    { title: 'Membership Details', component: Step3MembershipDetails },
    { title: 'Consent & Upload', component: Step4ConsentAndUpload }
  ];

  if (currentStep === 0) {
    return <LandingPage />;
  }

  if (isSubmitted) {
    return <SuccessPage />;
  }

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AMAOGBU Youth Stakeholders Membership Form
            </h1>
            <p className="text-gray-600">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between gap-2">
              {steps.map((step, index) => (
                <div key={index} className="flex-1">
                  <div className={`h-2 rounded ${index < currentStep ? 'bg-sky-500' : 'bg-gray-200'}`} />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <CurrentStepComponent />

          <div className="flex justify-between mt-8">
            <Button
              onClick={() => {
                setCurrentStep(prev => Math.max(1, prev - 1));
                setError('');
              }}
              variant="outline"
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={() => {
                  setCurrentStep(prev => prev + 1);
                  setError('');
                }}
                className="bg-sky-500 hover:bg-sky-600"
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              All data is securely stored in Google Sheets and files in Google Drive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipApp;