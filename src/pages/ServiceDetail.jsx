import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, CheckCircle, Globe, IndianRupee, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout/Layout';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore, useApplicationStore, useNotificationStore } from '@/lib/store';
import { useSchemeStore } from '@/stores/schemeStore';
import { toast } from 'sonner';
import { fetchDocumentFromDigiLocker } from '@/lib/digilocker';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const { t } = useTranslation();
  const { user, isAuthenticated, isAuthChecking } = useAuthStore();
  const { addApplication } = useApplicationStore();
  const { addNotification } = useNotificationStore();
  const [step, setStep] = useState('info');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    aadhaar: '',
    address: '',
    additionalInfo: '',
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [verifiedDocs, setVerifiedDocs] = useState([]);
  const [applicationId, setApplicationId] = useState('');
  const { getById } = useSchemeStore();

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  const service = serviceId ? getById(serviceId) : undefined;
  if (!service) {
    return (
      <Layout>
        <div className="container py-6 md:py-10 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('serviceNotFound')}</h2>
          <p className="text-muted-foreground mb-6">{t('serviceNotFoundDesc')}</p>
          <Link to="/services">
            <Button>{t('returnToServices')}</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleDocUpload = (docName) => {
    if (!uploadedDocs.includes(docName)) {
      setUploadedDocs((prev) => [...prev, docName]);
      toast.success(`${docName} uploaded successfully`);
    }
  };

  const handleDigiLockerFetch = async (docName) => {
    try {
      const result = await fetchDocumentFromDigiLocker(docName);
      if (result.success) {
        if (!uploadedDocs.includes(docName)) {
          setUploadedDocs((prev) => [...prev, docName]);
        }
        if (!verifiedDocs.includes(docName)) {
          setVerifiedDocs((prev) => [...prev, docName]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    const response = await addApplication({
      userId: user.id,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      formData: { ...formData, documents: uploadedDocs },
    });

    if (response.success) {
      setApplicationId(response.application.id); // The SSA- ID

      addNotification({
        userId: user.id,
        title: 'Application Submitted',
        message: `Your application for ${service.name} has been submitted successfully. Application ID: ${response.application.id}`,
        type: 'status',
        read: false,
      });

      setStep('success');
      toast.success("Application submitted successfully!");
    } else {
      toast.error(response.error || "Failed to submit application");
    }
  };

  return (<Layout>
    <div className="container py-6 md:py-10 max-w-3xl">
      {step === 'info' && (<>
        <Link to="/services">
          <Button variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            {t('backToServices')}
          </Button>
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {service.governmentLevel && (
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${service.governmentLevel === 'Central'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                  {service.governmentLevel} {t('government')}
                </span>
              )}
              {service.applicationMode && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {service.applicationMode}
                </span>
              )}
            </div>
            <CardTitle className="text-2xl">{service.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits Section */}
            {service.benefits ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-primary" /> {t('financialAssistance')}
                  </h3>
                  <p className="text-muted-foreground">{service.benefits.financial_assistance}</p>
                </div>
                {service.benefits.non_financial_support && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" /> {t('nonFinancialSupport')}
                    </h3>
                    <p className="text-muted-foreground">{service.benefits.non_financial_support}</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('description')}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            )}

            {/* Eligibility & Key Details Grid */}
            {service.isScheme && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.targetBeneficiaries && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users className="h-3 w-3" /> {t('targetBeneficiaries')}</p>
                    <p className="text-sm font-medium text-foreground">{service.targetBeneficiaries}</p>
                  </div>
                )}
                {service.incomeLimit && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {t('incomeLimit')}</p>
                    <p className="text-sm font-medium text-foreground">{service.incomeLimit}</p>
                  </div>
                )}
                {service.ageCriteria && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> {t('ageCriteria')}</p>
                    <p className="text-sm font-medium text-foreground">{service.ageCriteria}</p>
                  </div>
                )}
                {service.processingTimeDays && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {t('processingTime')}</p>
                    <p className="text-sm font-medium text-foreground">{service.processingTimeDays} {t('days')}</p>
                  </div>
                )}
                {service.validityPeriod && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('validityPeriod')}</p>
                    <p className="text-sm font-medium text-foreground">{service.validityPeriod}</p>
                  </div>
                )}
                {service.renewalRequired && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('renewalRequired')}</p>
                    <p className="text-sm font-medium text-foreground">{service.renewalRequired}</p>
                  </div>
                )}
                {service.applicationFee && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{t('applicationFee')}</p>
                    <p className="text-sm font-medium text-foreground">{service.applicationFee}</p>
                  </div>
                )}
              </div>
            )}

            {/* Application Process */}
            {service.applicationProcessSummary && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> {t('applicationProcess')}
                </h3>
                <p className="text-muted-foreground text-sm">{service.applicationProcessSummary}</p>
              </div>
            )}

            {/* Digital Features */}
            {service.digitalFeatures && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">{t('digitalFeatures')}</h3>
                <div className="flex flex-wrap gap-2">
                  {service.digitalFeatures.trackable && (
                    <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-full">
                      <Wifi className="h-3 w-3" /> {t('trackable')}
                    </span>
                  )}
                  {service.digitalFeatures.multilingual_support && (
                    <span className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 px-3 py-1.5 rounded-full">
                      <Globe className="h-3 w-3" /> {t('multilingual')}
                    </span>
                  )}
                  {service.digitalFeatures.voice_search_supported && (
                    <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-3 py-1.5 rounded-full">
                      <Mic className="h-3 w-3" /> {t('voiceSearch')}
                    </span>
                  )}
                  {service.digitalFeatures.document_locker_enabled && (
                    <span className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 px-3 py-1.5 rounded-full">
                      <FolderLock className="h-3 w-3" /> {t('digilocker')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Existing eligibility for non-scheme services */}
            {!service.isScheme && service.eligibility && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('eligibility')}</h3>
                <p className="text-muted-foreground">{service.eligibility}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-foreground mb-2">{t('requiredDocuments')}</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {service.documents.map((doc) => (<li key={doc}>{doc}</li>))}
              </ul>
            </div>

            <Button onClick={() => setStep('form')} className="w-full" size="lg">
              {t('apply')}
            </Button>
          </CardContent>
        </Card>
      </>)}

      {step === 'form' && (<Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setStep('info')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>{t('step1PersonalDetails')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{service.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('fullName')} *
            </label>
            <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name as per Aadhaar" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('mobileNumber')} *
            </label>
            <Input name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="10-digit mobile number" readOnly />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('email')}
            </label>
            <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('aadhaarNumber')} *
            </label>
            <Input name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} placeholder="12-digit Aadhaar number" maxLength={12} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('address')} *
            </label>
            <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('additionalInfo')}
            </label>
            <Input name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} placeholder="Any other relevant information" />
          </div>

          <Button onClick={() => setStep('documents')} className="w-full">
            {t('next')}: {t('uploadDocuments')}
          </Button>
        </CardContent>
      </Card>)}

      {step === 'documents' && (<Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setStep('form')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>{t('step2UploadDocuments')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{service.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              📂 <strong>{t('digilockerIntegration')}</strong> {t('digilockerDesc')}
            </p>
          </div>

          {service.documents.map((doc) => (<div key={doc} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-foreground">{doc}</span>
            </div>
            {uploadedDocs.includes(doc) ? (<div className="flex items-center gap-2 text-accent">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{t('uploaded')}</span>
              {verifiedDocs.includes(doc) && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">{t('verifiedViaDigilocker')}</span>}
            </div>) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDigiLockerFetch(doc)} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                  <span className="font-bold">DigiLocker</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDocUpload(doc)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {t('upload')}
                </Button>
              </div>
            )}
          </div>))}

          <Button onClick={() => setStep('confirm')} className="w-full">
            {t('next')}: {t('reviewSubmit')}
          </Button>
        </CardContent>
      </Card>)}

      {step === 'confirm' && (<Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setStep('documents')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>{t('step3ReviewSubmit')}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{service.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('personalDetails')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('nameLabel')}</span>
                <span className="text-foreground">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('mobileLabel')}</span>
                <span className="text-foreground">{formData.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('aadhaarLabel')}</span>
                <span className="text-foreground">XXXX-XXXX-{formData.aadhaar.slice(-4)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('documentsUploaded')}</h3>
            <div className="flex flex-wrap gap-2">
              {uploadedDocs.map((doc) => (<span key={doc} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm flex items-center gap-1">
                ✓ {doc}
                {verifiedDocs.includes(doc) && <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded ml-1">{t('verified')}</span>}
              </span>))}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('submissionConfirmation')}
            </p>
          </div>

          <Button onClick={handleSubmit} className="w-full" variant="hero">
            {t('submitApplication')}
          </Button>
        </CardContent>
      </Card>)}

      {step === 'success' && (<Card className="text-center">
        <CardContent className="py-12">
          <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('applicationSubmitted')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('applicationSubmittedDesc')}
          </p>
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">{t('applicationId')}</p>
            <p className="text-xl font-bold text-primary">{applicationId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/applications">
              <Button variant="outline">{t('trackApplication')}</Button>
            </Link>
            <Link to="/dashboard">
              <Button>{t('goToDashboard')}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>)}
    </div>
  </Layout>);
};

export default ServiceDetail;
