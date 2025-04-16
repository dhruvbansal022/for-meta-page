
import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import "../../stylesSelectLink.css";

// Define types for the widget instance
interface WidgetInstance {
  update: (data: any) => void;
  destroy?: () => void;
}

// Define types for the widget initialization options
interface WidgetOptions {
  targetUrl: string;
  buttonText: string;
  allowRedirection: boolean;
  openWith: string;
  containerStyles: {
    backgroundColor: string;
    padding: string;
    borderRadius: string;
  };
  buttonStyles: {
    fontSize: string;
    borderRadius: string;
    width: string;
  };
  containerClassName?: string;
  buttonClassName?: string;
}

interface WidgetRefMethods {
  updateWidget: (data: any) => void;
  reinitialize: () => void;
}

interface WidgetCaptureProps {
  urn?: string;
}

const WidgetDemo = forwardRef<WidgetRefMethods, WidgetCaptureProps>(({ urn }, ref) => {
  const [containerKey, setContainerKey] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetInstance = useRef<WidgetInstance | null>(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState<boolean>(false);
  const hasInitialized = useRef<boolean>(false);

  useImperativeHandle(ref, () => ({
    updateWidget: (data: any) => {
      if (widgetInstance.current) {
        widgetInstance.current.update(data);
      }
    },
    reinitialize: () => {
      cleanup();
      setContainerKey((prev) => prev + 1);
      hasInitialized.current = false;
      setTimeout(() => {
        initializeWidgetProcess();
      }, 100);
    },
  }));

  const cleanup = (): void => {
    if (widgetInstance.current && widgetInstance.current.destroy) {
      try {
        widgetInstance.current.destroy();
      } catch (e) {
        console.error("Error destroying widget:", e);
      }
      widgetInstance.current = null;
      setIsWidgetLoaded(false);
    }
    
    // Clear the container contents instead of trying to remove individual elements
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const initializeWidgetProcess = (): (() => void) | void => {
    if (hasInitialized.current) return;

    if (typeof (window as any).initializeDiroWidget === "function") {
      initializeWidget();
      hasInitialized.current = true;
    } else {
      const checkInterval = setInterval(() => {
        if (typeof (window as any).initializeDiroWidget === "function") {
          initializeWidget();
          hasInitialized.current = true;
          clearInterval(checkInterval);
        }
      }, 200);

      // Clear interval after 10 seconds to prevent memory leaks
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        console.warn("Failed to initialize widget after timeout");
      }, 10000);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
      };
    }
  };

  useEffect(() => {
    const timer = setTimeout(initializeWidgetProcess, 300);
    return () => clearTimeout(timer);
  }, [containerKey]);

  const initializeWidget = (): void => {
    if (!containerRef.current) return;
    
    try {
      // Clean up the container first to avoid potential DOM conflicts
      containerRef.current.innerHTML = "";
      
      // Create a new container for the widget
      const widgetContainer = document.createElement("div");
      widgetContainer.id = `diro-widget-inner-${containerKey}`;
      containerRef.current.appendChild(widgetContainer);

      const targetUrl = urn
        ? `https://verification.diro.io/?buttonid=O.c117bd44-8cfa-42df-99df-c4ad2ba6c6f5-Z6Jc&trackid=${urn}`
        : "https://verification.diro.io/?buttonid=O.c117bd44-8cfa-42df-99df-c4ad2ba6c6f5-Z6Jc&trackid=";

      // Make sure the widget initializer function exists
      if (typeof (window as any).initializeDiroWidget !== "function") {
        console.error("initializeDiroWidget is not available");
        return;
      }

      (window as any).initializeDiroWidget(widgetContainer, {
        targetUrl: targetUrl,
        allowRedirection: true,
        buttonText: "Start verification",
        openWith: "sametab",
        containerStyles: {
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "12px"
        },
        buttonStyles: {
          fontSize: "16px",
          borderRadius: "12px",
          width: "webkit",
        },
      });

      // Create a simplified widget instance with safer destroy method
      widgetInstance.current = {
        update: () => {},
        destroy: () => {
          if (containerRef.current) {
            containerRef.current.innerHTML = "";
          }
        },
      };

      setIsWidgetLoaded(true);
    } catch (error) {
      console.error("Error initializing Diro widget:", error);
      hasInitialized.current = false;
      setIsWidgetLoaded(false);
    }
  };

  return (
    <React.Fragment>
      {!isWidgetLoaded && <div className="widget-loading p-4 text-center">Loading Diro widget...</div>}

      <div className="w-full">
        <div
          key={`diro-container-${containerKey}`}
          className="diro-widget"
          id={`diro-widget-container-${containerKey}`}
          ref={containerRef}
          style={{ display: isWidgetLoaded ? "block" : "none", minHeight: "200px" }}
        />
      </div>
    </React.Fragment>
  );
});

export default WidgetDemo;
