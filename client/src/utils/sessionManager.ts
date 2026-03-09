import { toast } from "sonner";

interface SessionConfig {
  warningThreshold: number; // Minutes before expiration to show warning
  checkInterval: number; // Minutes between session checks
}

class SessionManager {
  private config: SessionConfig;
  private warningShown = false;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(config: SessionConfig = { warningThreshold: 5, checkInterval: 1 }) {
    this.config = config;
  }

  start() {
    if (this.checkInterval) {
      this.stop();
    }

    this.checkInterval = setInterval(() => {
      this.checkSession();
    }, this.config.checkInterval * 60 * 1000);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkSession() {
    try {
      // Check if we have a valid session
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        this.handleSessionExpired();
        return;
      }

      const session = await response.json();
      
      if (!session.user) {
        this.handleSessionExpired();
        return;
      }

      // Check if session is about to expire
      if (session.expiresAt) {
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilExpiry <= this.config.warningThreshold && !this.warningShown) {
          this.showExpirationWarning(Math.ceil(minutesUntilExpiry));
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
      // Don't immediately expire on network errors
    }
  }

  private showExpirationWarning(minutesLeft: number) {
    this.warningShown = true;
    
    toast.warning(`Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}`, {
      duration: 10000,
      action: {
        label: "Extend Session",
        onClick: () => this.extendSession(),
      },
    });
  }

  private async extendSession() {
    try {
      const response = await fetch('/api/auth/extend', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        this.warningShown = false;
        toast.success("Session extended successfully");
      } else {
        this.handleSessionExpired();
      }
    } catch (error) {
      console.error("Failed to extend session:", error);
      toast.error("Failed to extend session. Please log in again.");
      this.handleSessionExpired();
    }
  }

  private handleSessionExpired() {
    this.stop();
    toast.error("Your session has expired. Please log in again.", {
      duration: 5000,
    });
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/admin-login.html";
    }, 2000);
  }

  // Manual session validation for critical operations
  async validateSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        this.handleSessionExpired();
        return false;
      }

      const session = await response.json();
      return !!session.user;
    } catch (error) {
      console.error("Session validation failed:", error);
      return false;
    }
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();

// Auto-start session management for admin pages
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
  sessionManager.start();
}

export default SessionManager;