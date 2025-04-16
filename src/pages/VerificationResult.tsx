
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import VfsLogo from '../components/VfsLogo';
import FaqAccordion from '../components/FaqAccordion';
import { useToast } from "@/components/ui/use-toast";

const VerificationResult = () => {
  const { toast } = useToast();
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadWidget = async () => {
      try {
        // First load the CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://capturev2.diro.io/directlink-staging/stylesSelectLink.css';
        document.head.appendChild(link);
        
        // Then load the script
        const script = document.createElement('script');
        script.src = 'https://capturev2.diro.io/directlink/diroWidgetSelectLinkProd.js';
        script.async = true;
        
        // Create a promise to handle script loading
        const scriptLoaded = new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = (e) => reject(new Error('Failed to load DIRO widget script'));
        });
        
        // Append script to body
        document.body.appendChild(script);
        
        // Wait for script to load
        await scriptLoaded;
        
        // Allow time for script initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize widget
        if (isMounted) {
          initializeDiroWidget();
        }
      } catch (error) {
        console.error('Error loading DIRO widget:', error);
        if (isMounted) {
          setWidgetError('Failed to load verification widget. Please try again later.');
          toast({
            title: "Widget Error",
            description: "Failed to load verification widget. Please refresh the page or try again later.",
            variant: "destructive"
          });
        }
      }
    };
    
    const initializeDiroWidget = () => {
      const container = document.getElementById('diro-widget-container');
      
      if (window.initializeDiroWidget && container) {
        try {
          console.log("Initializing DIRO widget with container:", container);
          
          window.initializeDiroWidget(
            container,
            {
              targetUrl: "https://verification.diro.io/?buttonid=O.c117bd44-8cfa-42df-99df-c4ad2ba6c6f5-48sB&trackid=",
              allowRedirection: true,
              buttonText: "Start verification",
              openWith: "",
              containerStyles: {
                backgroundColor: "#ffffff",  // Adding the required backgroundColor property
                padding: "20px",            // Adding the required padding property
                borderRadius: "12px"        // Adding the required borderRadius property
              },
              buttonStyles: {
                fontSize: "16px",
                borderRadius: "12px",
                width: "300px",
              },
            }
          );
          
          console.log("DIRO widget initialized successfully");
          setWidgetLoaded(true);
        } catch (error) {
          console.error("Error initializing DIRO widget:", error);
          setWidgetError('Error initializing verification widget. Please try again later.');
          toast({
            title: "Widget Error",
            description: "Error initializing verification widget. Please try again later.",
            variant: "destructive"
          });
        }
      } else {
        console.error("Could not initialize DIRO widget - missing container or initialization function");
        setWidgetError('Verification widget could not be initialized. Please try again later.');
      }
    };
    
    loadWidget();
    
    // Cleanup function
    return () => {
      isMounted = false;
      const link = document.querySelector('link[href="https://capturev2.diro.io/directlink-staging/stylesSelectLink.css"]');
      const script = document.querySelector('script[src="https://capturev2.diro.io/directlink/diroWidgetSelectLinkProd.js"]');
      
      if (link && document.head.contains(link)) {
        document.head.removeChild(link);
      }
      
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  const handleGetSupport = () => {
    toast({
      title: "Support Request",
      description: "Our support team has been notified and will contact you shortly.",
    });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <VfsLogo />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Bank account verification for seamless Visa processing in Malta
            </h1>
            
            <p className="text-gray-600 mb-6">
              To ensure a seamless Visa processing experience and reduce the risk of financial discrepancies, 
              Meta requires applicants to verify their bank account statement. This step guarantees 
              timely and accurate financial transactions related to your Visa application.
            </p>
            
            <p className="text-gray-600 mb-6">
              Meta partners with <a href="#" className="text-meta-blue hover:underline">DIRO</a> for this process, 
              the leading provider of bank verification solutions trusted by F500 and Tier 1 global banks. Visit 
              DIRO <a href="#" className="text-meta-blue hover:underline">Trust Center</a>.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Verification Widget */}
            <div className="w-full max-w-md">
              {widgetError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                  <p className="text-red-600">{widgetError}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-meta-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Reload page
                  </button>
                </div>
              ) : (
                <div 
                  className="diro-widget w-full" 
                  id="diro-widget-container"
                  style={{ minHeight: "200px", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  {!widgetLoaded && (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                      <p className="mt-2 text-gray-600">Loading verification widget...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              className="w-full max-w-md border-2 border-meta-blue text-meta-blue px-6 py-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
              onClick={handleGetSupport}
            >
              Get support
            </button>
            
            <div className="mt-4 flex items-center">
              <span className="text-gray-600 mr-2">Powered by</span>
              <span className="font-semibold">DIRO</span>
            </div>
          </div>
          
          <div>
            <FaqAccordion />
            
            <div className="mt-8">
              <p className="text-gray-600">
                Learn more about DIRO's <a href="#" className="text-meta-blue hover:underline">bank</a> verification solutions.
              </p>
              
              <div className="mt-4">
                <a href="#" className="text-meta-blue hover:underline mr-4">Terms of Use</a>
                <a href="#" className="text-meta-blue hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerificationResult;
