"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, X } from "lucide-react";

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has dismissed before
      const dismissed = localStorage.getItem("installPromptDismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show iOS prompt if not dismissed
    if (iOS && !standalone) {
      const dismissed = localStorage.getItem("installPromptDismissed");
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Install Habit Tracker</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isIOS
                ? "Tap the share button and select 'Add to Home Screen'"
                : "Add to your home screen for quick access"}
            </p>
            {!isIOS && deferredPrompt && (
              <Button onClick={handleInstall} size="sm" className="mt-3 gap-2">
                <Download className="w-4 h-4" />
                Install App
              </Button>
            )}
            {isIOS && (
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Share className="w-4 h-4" />
                <span>Tap Share → Add to Home Screen</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
