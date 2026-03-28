import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import {
  Bell,
  Camera,
  Clock,
  Film,
  Home,
  MessageSquare,
  PlusSquare,
  Search,
  Settings,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { CameraFilter } from "./components/CameraFilter";
import { CreateReelForm } from "./components/CreateReelForm";
import { HomeTab } from "./components/HomeTab";
import { MessagesTab } from "./components/MessagesTab";
import { ProfileTab } from "./components/ProfileTab";
import { ReelsFeed } from "./components/ReelsFeed";
import { ScreenTimeModal } from "./components/ScreenTimeModal";
import { ScreenTimeWarning } from "./components/ScreenTimeWarning";
import { useTimeLimitTracker } from "./hooks/useTimeLimitTracker";

type Tab = "home" | "reels" | "create" | "messages" | "profile";

const NAV_ITEMS: {
  id: Tab;
  icon: React.FC<{ className?: string }>;
  label: string;
}[] = [
  { id: "home", icon: Home, label: "Home" },
  { id: "reels", icon: Film, label: "Reels" },
  { id: "create", icon: PlusSquare, label: "Create" },
  { id: "messages", icon: MessageSquare, label: "Messages" },
  { id: "profile", icon: User, label: "Profile" },
];

function getStoredUsername() {
  return localStorage.getItem("snapgram_username") ?? "";
}

function setStoredUsername(u: string) {
  localStorage.setItem("snapgram_username", u);
}

function formatRemaining(seconds: number): string {
  if (seconds < 60) return "< 1m left";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m left`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m left` : `${h}h left`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("reels");
  const [showScreenTime, setShowScreenTime] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showWarningDismissed, setShowWarningDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState(getStoredUsername);

  const {
    remainingSeconds,
    usedSeconds,
    limitSeconds,
    setLimit,
    isLimitReached,
    resetToday,
  } = useTimeLimitTracker();

  const handleUsernameChange = (u: string) => {
    setUsername(u);
    setStoredUsername(u);
  };

  const initials = username
    ? username
        .split("_")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Warning is shown when limit reached and not dismissed; but if dismissed,
  // it reappears after 1 minute or on tab focus (keeping it simple: just show again on tab change)
  const showWarning = isLimitReached && !showWarningDismissed;

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0B1220 0%, #060A12 100%)",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-[#0F172A]/95 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-base">
              S
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              Snapgram
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              data-ocid="header.search_input"
              type="text"
              placeholder="Search reels, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-full pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Time remaining pill */}
            <button
              type="button"
              data-ocid="header.toggle"
              onClick={() => setShowScreenTime(true)}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                isLimitReached
                  ? "bg-destructive/20 text-destructive border border-destructive/30"
                  : remainingSeconds < 600
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-muted/60 text-muted-foreground border border-border hover:text-foreground"
              }`}
              title="Screen time settings"
            >
              <Clock className="w-3 h-3" />
              {isLimitReached ? (
                <span className="font-bold">Time Up</span>
              ) : (
                <span>{formatRemaining(remainingSeconds)}</span>
              )}
            </button>

            <button
              type="button"
              data-ocid="camera.open_modal_button"
              onClick={() => setShowCamera(true)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              title="Camera with Filters"
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="button"
              data-ocid="header.button"
              onClick={() => setShowScreenTime(true)}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              title="Screen Time Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-secondary transition-colors relative"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              data-ocid="header.secondary_button"
            >
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarFallback className="gradient-brand text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center justify-around border-t border-border/50 px-2">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => {
                setActiveTab(id);
                // Re-show warning if limit reached and user navigates
                if (isLimitReached) setShowWarningDismissed(false);
              }}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs font-medium transition-all ${
                activeTab === id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {activeTab === id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <HomeTab
                username={username}
                onOpenScreenTime={() => setShowScreenTime(true)}
              />
            </motion.div>
          )}

          {activeTab === "reels" && (
            <motion.div
              key="reels"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ReelsFeed onOpenScreenTime={() => setShowScreenTime(true)} />
            </motion.div>
          )}

          {activeTab === "create" && (
            <motion.div
              key="create"
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CreateReelForm
                username={username}
                onSuccess={() => setActiveTab("reels")}
              />
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div
              key="messages"
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <MessagesTab username={username} />
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ProfileTab
                username={username}
                onUsernameChange={handleUsernameChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-[#060A12]/80 py-2 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <ScreenTimeModal
        isOpen={showScreenTime}
        onClose={() => setShowScreenTime(false)}
        usedSeconds={usedSeconds}
        limitSeconds={limitSeconds}
        onSetLimit={setLimit}
        onReset={resetToday}
      />

      <ScreenTimeWarning
        isVisible={showWarning}
        onDismiss={() => setShowWarningDismissed(true)}
        onOpenSettings={() => {
          setShowWarningDismissed(true);
          setShowScreenTime(true);
        }}
      />

      <CameraFilter isOpen={showCamera} onClose={() => setShowCamera(false)} />

      <Toaster />
    </div>
  );
}
