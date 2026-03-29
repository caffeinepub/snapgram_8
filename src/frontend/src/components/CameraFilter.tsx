import { useCamera } from "@/camera/useCamera";
import { Slider } from "@/components/ui/slider";
import {
  BookOpen,
  Download,
  Eye,
  Film,
  FlipHorizontal,
  Heart,
  RotateCcw,
  Share2,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterCategory =
  | "aesthetic"
  | "beauty"
  | "fun"
  | "trending"
  | "games"
  | "ar";

type CategoryTab =
  | "all"
  | "aesthetic"
  | "beauty"
  | "fun"
  | "trending"
  | "games"
  | "ar"
  | "favorites"
  | "adjust";

interface FilterItem {
  id: string;
  name: string;
  css: string;
  gradient: string;
  category: FilterCategory;
  emoji: string;
  viewCount: string;
  likeCount: number;
}

interface AROverlay {
  id: string;
  name: string;
  src: string | null;
  emoji: string;
  topRatio: number;
  widthRatio: number;
  heightRatio: number;
  viewCount: string;
  likeCount: number;
}

interface AdjustValues {
  brightness: number;
  contrast: number;
  blur: number;
  sharpen: number;
}

interface ManualPosition {
  x: number;
  y: number;
  scale: number;
}

// ─── Filter Data ─────────────────────────────────────────────────────────────

const ALL_FILTERS: FilterItem[] = [
  // AESTHETIC
  {
    id: "normal",
    name: "Normal",
    css: "none",
    gradient: "linear-gradient(135deg, #555 0%, #999 100%)",
    category: "aesthetic",
    emoji: "⚪",
    viewCount: "1.2B",
    likeCount: 12400,
  },
  {
    id: "vivid",
    name: "Vivid",
    css: "saturate(150%) brightness(110%)",
    gradient: "linear-gradient(135deg, #f6416c 0%, #ffcd3c 100%)",
    category: "aesthetic",
    emoji: "🌈",
    viewCount: "342M",
    likeCount: 3420,
  },
  {
    id: "noir",
    name: "Noir",
    css: "grayscale(100%) contrast(120%)",
    gradient: "linear-gradient(135deg, #000 0%, #555 100%)",
    category: "aesthetic",
    emoji: "🖤",
    viewCount: "89M",
    likeCount: 890,
  },
  {
    id: "warm",
    name: "Warm",
    css: "sepia(40%) saturate(120%)",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    category: "aesthetic",
    emoji: "🌅",
    viewCount: "156M",
    likeCount: 1560,
  },
  {
    id: "cool",
    name: "Cool",
    css: "hue-rotate(200deg) saturate(90%)",
    gradient: "linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)",
    category: "aesthetic",
    emoji: "❄️",
    viewCount: "204M",
    likeCount: 2040,
  },
  {
    id: "fade",
    name: "Fade",
    css: "brightness(110%) contrast(85%) saturate(80%)",
    gradient: "linear-gradient(135deg, #bdc3c7 0%, #e8e8e8 100%)",
    category: "aesthetic",
    emoji: "🌫️",
    viewCount: "67M",
    likeCount: 670,
  },
  {
    id: "dramatic",
    name: "Dramatic",
    css: "contrast(140%) saturate(130%)",
    gradient: "linear-gradient(135deg, #6b46c1 0%, #e040fb 100%)",
    category: "aesthetic",
    emoji: "🎭",
    viewCount: "93M",
    likeCount: 930,
  },
  {
    id: "vintage",
    name: "Vintage",
    css: "sepia(60%) contrast(110%)",
    gradient: "linear-gradient(135deg, #b7791f 0%, #f6d365 100%)",
    category: "aesthetic",
    emoji: "📷",
    viewCount: "178M",
    likeCount: 1780,
  },
  {
    id: "limelight",
    name: "Limelight",
    css: "brightness(115%) saturate(120%) hue-rotate(30deg)",
    gradient: "linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)",
    category: "aesthetic",
    emoji: "💚",
    viewCount: "34M",
    likeCount: 340,
  },
  {
    id: "dusk",
    name: "Dusk",
    css: "sepia(30%) hue-rotate(300deg) saturate(140%) brightness(90%)",
    gradient: "linear-gradient(135deg, #9b59b6 0%, #e74c3c 100%)",
    category: "aesthetic",
    emoji: "🌇",
    viewCount: "41M",
    likeCount: 410,
  },
  {
    id: "golden",
    name: "Golden",
    css: "sepia(50%) brightness(115%) saturate(150%)",
    gradient: "linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)",
    category: "aesthetic",
    emoji: "✨",
    viewCount: "245M",
    likeCount: 2450,
  },
  {
    id: "snap-bw",
    name: "B&W",
    css: "grayscale(100%) brightness(105%)",
    gradient: "linear-gradient(135deg, #fff 0%, #000 100%)",
    category: "aesthetic",
    emoji: "⬛",
    viewCount: "112M",
    likeCount: 1120,
  },
  {
    id: "cinematic",
    name: "Cinematic",
    css: "contrast(115%) saturate(85%) brightness(95%)",
    gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    category: "aesthetic",
    emoji: "🎬",
    viewCount: "88M",
    likeCount: 880,
  },
  // BEAUTY
  {
    id: "beauty-none",
    name: "None",
    css: "none",
    gradient: "linear-gradient(135deg, #555 0%, #999 100%)",
    category: "beauty",
    emoji: "🚫",
    viewCount: "520M",
    likeCount: 5200,
  },
  {
    id: "soft-skin",
    name: "Soft Skin",
    css: "brightness(108%) contrast(92%) saturate(105%) blur(0.5px)",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    category: "beauty",
    emoji: "🌸",
    viewCount: "730M",
    likeCount: 7300,
  },
  {
    id: "natural-glow",
    name: "Natural Glow",
    css: "brightness(112%) contrast(95%) saturate(110%)",
    gradient: "linear-gradient(135deg, #fffde7 0%, #f9a825 100%)",
    category: "beauty",
    emoji: "💫",
    viewCount: "456M",
    likeCount: 4560,
  },
  {
    id: "glam",
    name: "Glam",
    css: "brightness(105%) contrast(110%) saturate(130%) sepia(10%)",
    gradient: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
    category: "beauty",
    emoji: "💅",
    viewCount: "389M",
    likeCount: 3890,
  },
  {
    id: "cute",
    name: "Cute",
    css: "brightness(110%) saturate(115%) hue-rotate(-10deg) contrast(93%)",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    category: "beauty",
    emoji: "🥰",
    viewCount: "501M",
    likeCount: 5010,
  },
  {
    id: "k-beauty",
    name: "K-Beauty",
    css: "brightness(115%) contrast(88%) saturate(95%) hue-rotate(5deg)",
    gradient: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
    category: "beauty",
    emoji: "🌿",
    viewCount: "612M",
    likeCount: 6120,
  },
  {
    id: "porcelain",
    name: "Porcelain",
    css: "brightness(120%) contrast(85%) saturate(85%) blur(0.3px)",
    gradient: "linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)",
    category: "beauty",
    emoji: "🕊️",
    viewCount: "298M",
    likeCount: 2980,
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    css: "brightness(108%) saturate(120%) hue-rotate(-20deg) contrast(95%)",
    gradient: "linear-gradient(135deg, #f7c5a0 0%, #e8a0bf 100%)",
    category: "beauty",
    emoji: "🌹",
    viewCount: "445M",
    likeCount: 4450,
  },
  {
    id: "golden-hr",
    name: "Golden Hr",
    css: "sepia(25%) brightness(113%) saturate(130%) contrast(97%)",
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    category: "beauty",
    emoji: "🌟",
    viewCount: "267M",
    likeCount: 2670,
  },
  // FUN
  {
    id: "fun-rainbow",
    name: "Rainbow",
    css: "hue-rotate(45deg) saturate(200%) brightness(110%)",
    gradient: "linear-gradient(135deg, #f00 0%, #ff0 33%, #0f0 66%, #00f 100%)",
    category: "fun",
    emoji: "🌈",
    viewCount: "72M",
    likeCount: 720,
  },
  {
    id: "pixel",
    name: "Pixel",
    css: "contrast(200%) saturate(0%) brightness(120%)",
    gradient: "linear-gradient(135deg, #bbb 0%, #555 100%)",
    category: "fun",
    emoji: "🟦",
    viewCount: "18M",
    likeCount: 180,
  },
  {
    id: "neon",
    name: "Neon",
    css: "hue-rotate(270deg) saturate(300%) brightness(120%) contrast(110%)",
    gradient: "linear-gradient(135deg, #7b2ff7 0%, #00f7ff 100%)",
    category: "fun",
    emoji: "💜",
    viewCount: "143M",
    likeCount: 1430,
  },
  {
    id: "pop-art",
    name: "Pop Art",
    css: "saturate(300%) contrast(130%)",
    gradient: "linear-gradient(135deg, #ff0090 0%, #ffff00 100%)",
    category: "fun",
    emoji: "🎨",
    viewCount: "95M",
    likeCount: 950,
  },
  {
    id: "glitch",
    name: "Glitch",
    css: "hue-rotate(120deg) saturate(150%) contrast(140%)",
    gradient: "linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)",
    category: "fun",
    emoji: "⚡",
    viewCount: "57M",
    likeCount: 570,
  },
  {
    id: "dream",
    name: "Dream",
    css: "blur(1px) brightness(115%) saturate(80%) sepia(20%)",
    gradient: "linear-gradient(135deg, #ffd1ff 0%, #c8b6ff 100%)",
    category: "fun",
    emoji: "💭",
    viewCount: "84M",
    likeCount: 840,
  },
  // TRENDING
  {
    id: "vsco",
    name: "VSCO",
    css: "brightness(108%) contrast(92%) saturate(90%) sepia(10%)",
    gradient: "linear-gradient(135deg, #d4a574 0%, #e8d5b7 100%)",
    category: "trending",
    emoji: "📸",
    viewCount: "318M",
    likeCount: 3180,
  },
  {
    id: "film",
    name: "Film",
    css: "sepia(30%) contrast(105%) brightness(102%) saturate(90%)",
    gradient: "linear-gradient(135deg, #8b5e3c 0%, #e8d5b7 100%)",
    category: "trending",
    emoji: "🎞️",
    viewCount: "192M",
    likeCount: 1920,
  },
  {
    id: "moody",
    name: "Moody",
    css: "contrast(130%) saturate(80%) brightness(85%)",
    gradient: "linear-gradient(135deg, #1a2a4a 0%, #6b7280 100%)",
    category: "trending",
    emoji: "🌑",
    viewCount: "221M",
    likeCount: 2210,
  },
  {
    id: "y2k",
    name: "Y2K",
    css: "saturate(160%) hue-rotate(-15deg) brightness(115%) contrast(105%)",
    gradient: "linear-gradient(135deg, #a8ff78 0%, #ff78a8 100%)",
    category: "trending",
    emoji: "💿",
    viewCount: "176M",
    likeCount: 1760,
  },
  {
    id: "retro",
    name: "Retro",
    css: "sepia(70%) contrast(120%) brightness(95%)",
    gradient: "linear-gradient(135deg, #f4a261 0%, #e76f51 100%)",
    category: "trending",
    emoji: "📻",
    viewCount: "134M",
    likeCount: 1340,
  },
  {
    id: "aura",
    name: "Aura",
    css: "hue-rotate(200deg) saturate(120%) brightness(110%) contrast(95%)",
    gradient: "linear-gradient(135deg, #4158d0 0%, #c850c0 100%)",
    category: "trending",
    emoji: "🔮",
    viewCount: "88M",
    likeCount: 880,
  },
  // GAMES
  {
    id: "8bit",
    name: "8-Bit",
    css: "contrast(150%) saturate(200%) brightness(110%)",
    gradient:
      "linear-gradient(135deg, #ff0000 0%, #ffff00 33%, #00ff00 66%, #0000ff 100%)",
    category: "games",
    emoji: "🕹️",
    viewCount: "64M",
    likeCount: 640,
  },
  {
    id: "matrix",
    name: "Matrix",
    css: "sepia(100%) hue-rotate(90deg) saturate(400%) brightness(70%) contrast(120%)",
    gradient: "linear-gradient(135deg, #000 0%, #00ff41 100%)",
    category: "games",
    emoji: "💚",
    viewCount: "119M",
    likeCount: 1190,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    css: "hue-rotate(280deg) saturate(200%) contrast(130%) brightness(105%)",
    gradient: "linear-gradient(135deg, #1a0533 0%, #ffd700 100%)",
    category: "games",
    emoji: "🤖",
    viewCount: "77M",
    likeCount: 770,
  },
  {
    id: "horror",
    name: "Horror",
    css: "grayscale(60%) contrast(130%) brightness(75%) sepia(30%)",
    gradient: "linear-gradient(135deg, #1a0000 0%, #8b0000 100%)",
    category: "games",
    emoji: "💀",
    viewCount: "52M",
    likeCount: 520,
  },
  {
    id: "arcade",
    name: "Arcade",
    css: "saturate(250%) hue-rotate(30deg) contrast(120%) brightness(115%)",
    gradient: "linear-gradient(135deg, #ff6b00 0%, #ff00cc 100%)",
    category: "games",
    emoji: "🎮",
    viewCount: "43M",
    likeCount: 430,
  },
];

const AR_OVERLAYS: AROverlay[] = [
  {
    id: "ar-none",
    name: "None",
    src: null,
    emoji: "🚫",
    topRatio: 0,
    widthRatio: 0,
    heightRatio: 0,
    viewCount: "0",
    likeCount: 0,
  },
  {
    id: "glasses",
    name: "Glasses",
    src: "/assets/generated/ar-glasses-transparent.dim_400x150.png",
    emoji: "🕶️",
    topRatio: 0.3,
    widthRatio: 1.1,
    heightRatio: 150 / 400,
    viewCount: "89M",
    likeCount: 890,
  },
  {
    id: "dog",
    name: "Dog",
    src: "/assets/generated/ar-dog-transparent.dim_400x300.png",
    emoji: "🐶",
    topRatio: -0.5,
    widthRatio: 1.3,
    heightRatio: 300 / 400,
    viewCount: "156M",
    likeCount: 1560,
  },
  {
    id: "cat",
    name: "Cat Ears",
    src: "/assets/generated/ar-cat-transparent.dim_400x200.png",
    emoji: "🐱",
    topRatio: -0.45,
    widthRatio: 1.3,
    heightRatio: 200 / 400,
    viewCount: "134M",
    likeCount: 1340,
  },
  {
    id: "crown",
    name: "Crown",
    src: "/assets/generated/ar-crown-transparent.dim_300x180.png",
    emoji: "👑",
    topRatio: -0.6,
    widthRatio: 0.9,
    heightRatio: 180 / 300,
    viewCount: "200M",
    likeCount: 2000,
  },
  {
    id: "flower-crown",
    name: "Flower Crown",
    src: "/assets/generated/ar-flower-crown-transparent.dim_500x200.png",
    emoji: "🌸",
    topRatio: -0.55,
    widthRatio: 1.4,
    heightRatio: 200 / 500,
    viewCount: "178M",
    likeCount: 1780,
  },
  {
    id: "bunny",
    name: "Bunny",
    src: "/assets/generated/ar-bunny-transparent.dim_400x300.png",
    emoji: "🐰",
    topRatio: -0.65,
    widthRatio: 1.2,
    heightRatio: 300 / 400,
    viewCount: "112M",
    likeCount: 1120,
  },
  {
    id: "heart-eyes",
    name: "Heart Eyes",
    src: "/assets/generated/ar-heart-eyes-transparent.dim_400x150.png",
    emoji: "😍",
    topRatio: 0.2,
    widthRatio: 1.05,
    heightRatio: 150 / 400,
    viewCount: "67M",
    likeCount: 670,
  },
  {
    id: "butterfly",
    name: "Butterfly",
    src: "/assets/generated/ar-butterfly-transparent.dim_500x200.png",
    emoji: "🦋",
    topRatio: 0.25,
    widthRatio: 1.6,
    heightRatio: 200 / 500,
    viewCount: "93M",
    likeCount: 930,
  },
  {
    id: "rainbow-ar",
    name: "Rainbow",
    src: "/assets/generated/ar-rainbow-vomit-transparent.dim_400x500.png",
    emoji: "🌈",
    topRatio: 0.3,
    widthRatio: 0.9,
    heightRatio: 500 / 400,
    viewCount: "30M",
    likeCount: 300,
  },
];

const DEFAULT_ADJUST: AdjustValues = {
  brightness: 1.0,
  contrast: 1.0,
  blur: 0,
  sharpen: 0,
};

const CATEGORY_TABS: { id: CategoryTab; label: string }[] = [
  { id: "all", label: "✨ All" },
  { id: "aesthetic", label: "🎨 Aesthetic" },
  { id: "beauty", label: "💄 Beauty" },
  { id: "fun", label: "🎉 Fun" },
  { id: "trending", label: "🔥 Trending" },
  { id: "games", label: "🎮 Games" },
  { id: "ar", label: "🤳 AR" },
  { id: "favorites", label: "⭐ Favorites" },
  { id: "adjust", label: "🎛️ Adjust" },
];

// ─── Sub-component: AdjustSlider ─────────────────────────────────────────────

function AdjustSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs w-16 shrink-0"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        {label}
      </span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <span
        className="text-xs w-8 text-right shrink-0"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface CameraFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CameraFilter({ isOpen, onClose }: CameraFilterProps) {
  // Camera hook
  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    isActive: cameraActive,
    isLoading: cameraLoading,
    error: cameraHookError,
    currentFacingMode,
  } = useCamera({ facingMode: "user", width: 640, height: 480 });

  // Refs
  const categoryPillsRef = useRef<HTMLDivElement>(null);
  const filterStripRef = useRef<HTMLDivElement>(null);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const cameraError = cameraHookError ? cameraHookError.message : null;

  // UI state
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("all");
  const [filterLabelVisible, setFilterLabelVisible] = useState(false);
  const [filterLabelText, setFilterLabelText] = useState("");
  const filterLabelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state
  const [activeFilterId, setActiveFilterId] = useState("normal");
  const [activeARId, setActiveARId] = useState("ar-none");
  const [adjust, setAdjust] = useState<AdjustValues>(DEFAULT_ADJUST);

  // Engagement state
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(() => {
    const m = new Map<string, number>();
    for (const f of ALL_FILTERS) m.set(f.id, f.likeCount);
    for (const a of AR_OVERLAYS) m.set(a.id, a.likeCount);
    return m;
  });
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("snapgram_fav_filters");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // AR state
  const [manualPos, setManualPos] = useState<ManualPosition>({
    x: 0.5,
    y: 0.35,
    scale: 1,
  });

  // Drag state
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initPX: number;
    initPY: number;
  } | null>(null);
  const pinchRef = useRef<{ initDist: number; initScale: number } | null>(null);

  // ─── Persist favorites ───────────────────────────────────────────────────

  useEffect(() => {
    localStorage.setItem(
      "snapgram_fav_filters",
      JSON.stringify(Array.from(favorites)),
    );
  }, [favorites]);

  // ─── Computed filter string ─────────────────────────────────────────────

  const _activeFilter =
    ALL_FILTERS.find((f) => f.id === activeFilterId) ?? ALL_FILTERS[0];
  const activeAR =
    AR_OVERLAYS.find((a) => a.id === activeARId) ?? AR_OVERLAYS[0];

  // Determine beauty filter from activeFilterId if in beauty category
  const activeBeautyFilter = ALL_FILTERS.find(
    (f) => f.id === activeFilterId && f.category === "beauty",
  );
  const activeColorFilter = ALL_FILTERS.find(
    (f) => f.id === activeFilterId && f.category !== "beauty",
  );

  const composedFilter = (() => {
    const base =
      activeColorFilter && activeColorFilter.css !== "none"
        ? activeColorFilter.css
        : "";
    const beautyCSS =
      activeBeautyFilter && activeBeautyFilter.css !== "none"
        ? activeBeautyFilter.css
        : "";
    const bri =
      adjust.brightness !== 1 ? `brightness(${adjust.brightness})` : "";
    const con = adjust.contrast !== 1 ? `contrast(${adjust.contrast})` : "";
    const blr = adjust.blur > 0 ? `blur(${adjust.blur}px)` : "";
    const sharpenCon =
      adjust.sharpen > 0 ? `contrast(${1 + adjust.sharpen * 0.3})` : "";
    const sharpenSat =
      adjust.sharpen > 0 ? `saturate(${1 + adjust.sharpen * 0.2})` : "";
    return (
      [base, beautyCSS, bri, con, blr, sharpenCon, sharpenSat]
        .filter(Boolean)
        .join(" ") || "none"
    );
  })();

  // ─── Mount / unmount effects ─────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setActiveFilterId("normal");
      setAdjust(DEFAULT_ADJUST);
      setActiveCategory("all");
      setActiveARId("ar-none");
    }
    return () => {
      if (!isOpen) stopCamera();
    };
  }, [isOpen, capturedImage, startCamera, stopCamera]); // eslint-disable-line

  // Preload overlay image ref for canvas drawing
  useEffect(() => {
    if (activeAR.src) {
      const img = new Image();
      img.src = activeAR.src;
      img.crossOrigin = "anonymous";
      overlayImgRef.current = img;
    } else {
      overlayImgRef.current = null;
    }
  }, [activeAR.src]);

  // ─── Filter helpers ──────────────────────────────────────────────────────

  const showFilterLabel = (name: string) => {
    setFilterLabelText(name);
    setFilterLabelVisible(true);
    if (filterLabelTimeout.current) clearTimeout(filterLabelTimeout.current);
    filterLabelTimeout.current = setTimeout(
      () => setFilterLabelVisible(false),
      1400,
    );
  };

  const handleSelectFilter = (filterId: string) => {
    setActiveFilterId(filterId);
    const f = ALL_FILTERS.find((x) => x.id === filterId);
    if (f) showFilterLabel(f.name);
  };

  const handleSelectAR = (arId: string) => {
    setActiveARId(arId);
    const a = AR_OVERLAYS.find((x) => x.id === arId);
    if (a && a.name !== "None") showFilterLabel(a.name);
  };

  const handleLikeFilter = (id: string) => {
    setLikeCounts((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? 0;
      next.set(id, likedIds.has(id) ? current - 1 : current + 1);
      return next;
    });
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Active item for rail display
  const activeItemForRail: { id: string; viewCount: string } | null = (() => {
    if (activeARId !== "ar-none") {
      const a = AR_OVERLAYS.find((x) => x.id === activeARId);
      return a ? { id: a.id, viewCount: a.viewCount } : null;
    }
    const f = ALL_FILTERS.find((x) => x.id === activeFilterId);
    return f ? { id: f.id, viewCount: f.viewCount } : null;
  })();

  const activeRailId = activeItemForRail?.id ?? activeFilterId;
  const activeRailViewCount = activeItemForRail?.viewCount ?? "";

  // ─── Capture ─────────────────────────────────────────────────────────────

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.filter = composedFilter;
    if (currentFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    ctx.filter = "none";
    if (currentFacingMode === "user") {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const overlayImg = overlayImgRef.current;
    if (overlayImg && activeAR.src) {
      const cw = canvas.width;
      const ch = canvas.height;

      const ow = cw * 0.5 * manualPos.scale;
      const oh = ow * activeAR.heightRatio;
      const ox = manualPos.x * cw - ow / 2;
      const oy = manualPos.y * ch - oh / 2;
      ctx.drawImage(overlayImg, ox, oy, ow, oh);
    }

    const dataUrl = canvas.toDataURL("image/png");
    setTimeout(() => {
      setCapturedImage(dataUrl);
      stopCamera();
    }, 150);
  };

  const handleSave = () => {
    if (!capturedImage) return;
    const a = document.createElement("a");
    a.href = capturedImage;
    a.download = `snapgram-photo-${Date.now()}.png`;
    a.click();
    toast.success("Photo saved!");
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  // ─── AR overlay positioning ──────────────────────────────────────────────

  const getAROverlayStyle = (): React.CSSProperties => {
    const containerW = containerRef.current?.offsetWidth ?? 360;
    const containerH = containerRef.current?.offsetHeight ?? 640;
    const ow = containerW * 0.5 * manualPos.scale;
    const oh = ow * activeAR.heightRatio;
    return {
      position: "absolute",
      left: manualPos.x * containerW - ow / 2,
      top: manualPos.y * containerH - oh / 2,
      width: ow,
      height: oh,
      objectFit: "contain",
      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
      cursor: "grab",
      touchAction: "none",
    };
  };

  // ─── Drag handlers (manual mode) ─────────────────────────────────────────

  const onOverlayPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initPX: manualPos.x,
      initPY: manualPos.y,
    };
  };

  const onOverlayPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragRef.current) return;
    const containerW = containerRef.current?.offsetWidth ?? 360;
    const containerH = containerRef.current?.offsetHeight ?? 640;
    const dx = (e.clientX - dragRef.current.startX) / containerW;
    const dy = (e.clientY - dragRef.current.startY) / containerH;
    setManualPos((p) => ({
      ...p,
      x: Math.max(0, Math.min(1, dragRef.current!.initPX + dx)),
      y: Math.max(0, Math.min(1, dragRef.current!.initPY + dy)),
    }));
  };

  const onOverlayPointerUp = () => {
    dragRef.current = null;
  };

  const onOverlayTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = {
        initDist: Math.sqrt(dx * dx + dy * dy),
        initScale: manualPos.scale,
      };
    }
  };

  const onOverlayTouchMove = (e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const newScale = Math.max(
        0.2,
        Math.min(
          3,
          pinchRef.current.initScale * (dist / pinchRef.current.initDist),
        ),
      );
      setManualPos((p) => ({ ...p, scale: newScale }));
    }
  };

  // ─── Filtered lists for category ─────────────────────────────────────────

  const getFiltersForCategory = () => {
    if (activeCategory === "all") return ALL_FILTERS;
    if (activeCategory === "favorites")
      return ALL_FILTERS.filter((f) => favorites.has(f.id));
    return ALL_FILTERS.filter((f) => f.category === activeCategory);
  };

  const visibleFilters = getFiltersForCategory();

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="camera.modal"
          ref={containerRef}
          className="fixed inset-0 z-50 bg-black overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ═══════════════ CAMERA / CAPTURED VIEW ═══════════════ */}
          {!capturedImage ? (
            <>
              {/* Video */}
              {cameraError ? (
                <div
                  data-ocid="camera.error_state"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 bg-black/80"
                >
                  {cameraHookError?.type === "permission" ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                        <span className="text-4xl">🚫</span>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">
                          Camera Permission Denied
                        </h3>
                        <p className="text-white/60 text-xs">
                          Browser ne camera access block kar diya hai
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 text-left w-full max-w-xs space-y-3">
                        <p className="text-white/90 text-sm font-semibold mb-2">
                          Permission allow karne ke steps:
                        </p>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">1️⃣</span>
                          <p className="text-white/80 text-sm">
                            Browser ke address bar mein 🔒 icon tap karein
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">2️⃣</span>
                          <p className="text-white/80 text-sm">
                            Camera permission ko{" "}
                            <strong className="text-white">'Allow'</strong>{" "}
                            karein
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">3️⃣</span>
                          <p className="text-white/80 text-sm">
                            Page refresh karein
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap justify-center">
                        <button
                          type="button"
                          data-ocid="camera.primary_button"
                          onClick={() => startCamera()}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-bold shadow-lg"
                        >
                          🔄 Retry
                        </button>
                        <button
                          type="button"
                          data-ocid="camera.secondary_button"
                          onClick={() => window.location.reload()}
                          className="px-6 py-3 rounded-full bg-white/20 border border-white/30 text-white text-sm font-bold"
                        >
                          🔃 Reload Page
                        </button>
                      </div>
                      <p className="text-white/40 text-xs">
                        Agar phir bhi kaam na kare, browser settings mein camera
                        allow karein aur page reload karein
                      </p>
                    </>
                  ) : cameraHookError?.type === "not-found" ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center">
                        <span className="text-4xl">📷</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">
                        No Camera Found
                      </h3>
                      <p className="text-white/70 text-sm">
                        Is device mein koi camera nahi mila.
                      </p>
                      <button
                        type="button"
                        data-ocid="camera.primary_button"
                        onClick={() => startCamera()}
                        className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold"
                      >
                        Retry
                      </button>
                    </>
                  ) : cameraHookError?.type === "not-supported" ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                        <span className="text-4xl">🌐</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">
                        Browser Support Nahi
                      </h3>
                      <p className="text-white/70 text-sm">
                        Camera is not supported in this browser.
                      </p>
                      <p className="text-white/50 text-xs">
                        Please use Chrome or Safari.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-3xl">📷</span>
                      </div>
                      <p className="text-white/80 text-sm">{cameraError}</p>
                      <button
                        type="button"
                        data-ocid="camera.primary_button"
                        onClick={() => startCamera()}
                        className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      filter: composedFilter,
                      transform:
                        currentFacingMode === "user" ? "scaleX(-1)" : "none",
                    }}
                  />
                  {/* Loading spinner overlay */}
                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
                      <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin mb-3" />
                      <p className="text-white/80 text-sm">
                        Camera shuru ho rahi hai...
                      </p>
                    </div>
                  )}
                  {/* Tap to start placeholder when camera not yet active and not loading */}
                  {!cameraActive && !cameraLoading && (
                    <button
                      type="button"
                      data-ocid="camera.canvas_target"
                      onClick={() => startCamera()}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 cursor-pointer"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-3">
                        <span className="text-4xl">📷</span>
                      </div>
                      <p className="text-white font-semibold text-base">
                        Camera shuru karne ke liye tap karein
                      </p>
                      <p className="text-white/50 text-xs mt-1">
                        Tap to start camera
                      </p>
                    </button>
                  )}
                </>
              )}

              {/* AR Overlay */}
              {activeAR.src && (
                <img
                  key={activeAR.id}
                  src={activeAR.src}
                  alt={activeAR.name}
                  style={getAROverlayStyle()}
                  onPointerDown={onOverlayPointerDown}
                  onPointerMove={onOverlayPointerMove}
                  onPointerUp={onOverlayPointerUp}
                  onTouchStart={onOverlayTouchStart}
                  onTouchMove={onOverlayTouchMove}
                  draggable={false}
                />
              )}

              {/* Manual drag hint */}
              {activeAR.src && (
                <motion.div
                  className="absolute top-24 inset-x-0 flex justify-center pointer-events-none z-20"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    ✋ Drag to reposition · Pinch to resize
                  </span>
                </motion.div>
              )}

              {/* Flash */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.div
                    className="absolute inset-0 bg-white pointer-events-none z-30"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {/* Filter name popup */}
              <AnimatePresence>
                {filterLabelVisible && (
                  <motion.div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-20"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className="px-5 py-2 rounded-full text-white text-base font-semibold tracking-wide"
                      style={{
                        background: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {filterLabelText}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Top bar ── */}
              <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between px-4 pt-10 pb-4">
                <button
                  type="button"
                  data-ocid="camera.close_button"
                  onClick={handleClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <X className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  data-ocid="camera.toggle"
                  onClick={() => switchCamera()}
                  className="w-11 h-11 flex items-center justify-center rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <FlipHorizontal
                    className="w-5 h-5 text-white"
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              {/* ── Right-side vertical icon rail ── */}
              <div
                className="absolute right-3 z-20 flex flex-col items-center gap-4"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              >
                {/* Views */}
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Eye className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span
                    className="text-white font-semibold"
                    style={{ fontSize: "9px", textShadow: "0 1px 4px #000" }}
                  >
                    {activeRailViewCount}
                  </span>
                </div>

                {/* Like */}
                <div className="flex flex-col items-center gap-0.5">
                  <motion.button
                    type="button"
                    data-ocid="camera.filter.toggle"
                    onClick={() => handleLikeFilter(activeRailId)}
                    whileTap={{ scale: 1.3 }}
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Heart
                      className="w-5 h-5"
                      style={{
                        color: likedIds.has(activeRailId) ? "#ff3b5c" : "white",
                        fill: likedIds.has(activeRailId)
                          ? "#ff3b5c"
                          : "transparent",
                      }}
                      strokeWidth={2}
                    />
                  </motion.button>
                  <span
                    className="text-white font-semibold"
                    style={{ fontSize: "9px", textShadow: "0 1px 4px #000" }}
                  >
                    {(() => {
                      const count = likeCounts.get(activeRailId) ?? 0;
                      return count >= 1000000
                        ? `${(count / 1000000).toFixed(1)}M`
                        : count >= 1000
                          ? `${(count / 1000).toFixed(1)}K`
                          : String(count);
                    })()}
                  </span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center gap-0.5">
                  <motion.button
                    type="button"
                    data-ocid="camera.share.button"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(window.location.href)
                        .catch(() => {});
                      toast.success("Link copied!");
                    }}
                    whileTap={{ scale: 0.92 }}
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Share2 className="w-5 h-5 text-white" strokeWidth={2} />
                  </motion.button>
                  <span
                    className="text-white"
                    style={{ fontSize: "9px", textShadow: "0 1px 4px #000" }}
                  >
                    Share
                  </span>
                </div>

                {/* Favorite */}
                <div className="flex flex-col items-center gap-0.5">
                  <motion.button
                    type="button"
                    data-ocid="camera.favorite.toggle"
                    onClick={() => handleToggleFavorite(activeRailId)}
                    whileTap={{ scale: 1.3 }}
                    className="w-10 h-10 flex items-center justify-center rounded-full"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Star
                      className="w-5 h-5"
                      style={{
                        color: favorites.has(activeRailId)
                          ? "#ffd700"
                          : "white",
                        fill: favorites.has(activeRailId)
                          ? "#ffd700"
                          : "transparent",
                      }}
                      strokeWidth={2}
                    />
                  </motion.button>
                  <span
                    className="text-white"
                    style={{ fontSize: "9px", textShadow: "0 1px 4px #000" }}
                  >
                    {favorites.has(activeRailId) ? "Saved" : "Save"}
                  </span>
                </div>
              </div>

              {/* ── Bottom panel ── */}
              <div
                className="absolute bottom-0 inset-x-0 z-20"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)",
                }}
              >
                {/* Category pills */}
                <div
                  ref={categoryPillsRef}
                  className="flex gap-2 overflow-x-auto px-4 pt-3 pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {CATEGORY_TABS.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      data-ocid={`camera.${cat.id}.tab`}
                      onClick={() => setActiveCategory(cat.id)}
                      className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                      style={{
                        background:
                          activeCategory === cat.id
                            ? "rgba(255,255,255,1)"
                            : "rgba(255,255,255,0.15)",
                        color:
                          activeCategory === cat.id
                            ? "#000"
                            : "rgba(255,255,255,0.75)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Filter content area - ~130px */}
                <AnimatePresence mode="wait">
                  {activeCategory === "adjust" ? (
                    <motion.div
                      key="adjust"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="px-5 pb-2 pt-1 space-y-2.5"
                      style={{ minHeight: 130 }}
                    >
                      <AdjustSlider
                        label="Brightness"
                        value={adjust.brightness}
                        min={0.5}
                        max={2.0}
                        step={0.05}
                        onChange={(v) =>
                          setAdjust((a) => ({ ...a, brightness: v }))
                        }
                      />
                      <AdjustSlider
                        label="Contrast"
                        value={adjust.contrast}
                        min={0.5}
                        max={2.0}
                        step={0.05}
                        onChange={(v) =>
                          setAdjust((a) => ({ ...a, contrast: v }))
                        }
                      />
                      <AdjustSlider
                        label="Blur"
                        value={adjust.blur}
                        min={0}
                        max={5}
                        step={0.1}
                        onChange={(v) => setAdjust((a) => ({ ...a, blur: v }))}
                      />
                      <AdjustSlider
                        label="Sharpen"
                        value={adjust.sharpen}
                        min={0}
                        max={2}
                        step={0.05}
                        onChange={(v) =>
                          setAdjust((a) => ({ ...a, sharpen: v }))
                        }
                      />
                      {activeAR.src && (
                        <>
                          <AdjustSlider
                            label="Overlay X"
                            value={manualPos.x}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(v) =>
                              setManualPos((p) => ({ ...p, x: v }))
                            }
                          />
                          <AdjustSlider
                            label="Overlay Y"
                            value={manualPos.y}
                            min={0}
                            max={1}
                            step={0.01}
                            onChange={(v) =>
                              setManualPos((p) => ({ ...p, y: v }))
                            }
                          />
                          <AdjustSlider
                            label="Size"
                            value={manualPos.scale}
                            min={0.2}
                            max={3}
                            step={0.05}
                            onChange={(v) =>
                              setManualPos((p) => ({ ...p, scale: v }))
                            }
                          />
                        </>
                      )}
                      <button
                        type="button"
                        data-ocid="camera.adjust.button"
                        onClick={() => {
                          setAdjust(DEFAULT_ADJUST);
                          setManualPos({ x: 0.5, y: 0.35, scale: 1 });
                        }}
                        className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          background: "rgba(255,255,255,0.1)",
                        }}
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    </motion.div>
                  ) : activeCategory === "ar" ? (
                    <motion.div
                      key="ar"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      style={{ minHeight: 130 }}
                    >
                      <div
                        ref={filterStripRef}
                        className="flex gap-3 overflow-x-auto px-4 pb-1 pt-1"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {AR_OVERLAYS.map((ar) => (
                          <button
                            type="button"
                            key={ar.id}
                            data-ocid="camera.ar.button"
                            onClick={() => handleSelectAR(ar.id)}
                            className="flex flex-col items-center gap-1 shrink-0"
                          >
                            <span
                              className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 text-2xl relative"
                              style={{
                                background: "rgba(255,255,255,0.12)",
                                boxShadow:
                                  activeARId === ar.id
                                    ? "0 0 0 3px #fff, 0 0 0 5px rgba(255,255,255,0.3)"
                                    : "0 0 0 1.5px rgba(255,255,255,0.2)",
                                transform:
                                  activeARId === ar.id
                                    ? "scale(1.12)"
                                    : "scale(1)",
                              }}
                            >
                              {ar.emoji}
                            </span>
                            <span
                              className="text-xs font-medium leading-tight"
                              style={{
                                color:
                                  activeARId === ar.id
                                    ? "#fff"
                                    : "rgba(255,255,255,0.5)",
                                textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                              }}
                            >
                              {ar.name}
                            </span>
                            <span
                              className="text-white/40"
                              style={{ fontSize: "9px" }}
                            >
                              {ar.viewCount} 👁
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="px-4 pb-1">
                        <span
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          ✋ Manual mode — drag overlay to position
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      style={{ minHeight: 130 }}
                    >
                      {visibleFilters.length === 0 ? (
                        <div
                          data-ocid="camera.favorites.empty_state"
                          className="flex flex-col items-center justify-center py-6 gap-2"
                        >
                          <span className="text-3xl">⭐</span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            No favorites yet. Tap ⭐ to save a filter.
                          </span>
                        </div>
                      ) : (
                        <div
                          className="flex gap-3 overflow-x-auto px-4 pb-1 pt-1"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {visibleFilters.map((filter) => (
                            <button
                              type="button"
                              key={filter.id}
                              data-ocid="camera.filter.button"
                              onClick={() => handleSelectFilter(filter.id)}
                              className="flex flex-col items-center gap-1 shrink-0"
                            >
                              <span
                                className="w-14 h-14 rounded-full block transition-all duration-200 relative"
                                style={{
                                  background: filter.gradient,
                                  boxShadow:
                                    activeFilterId === filter.id
                                      ? "0 0 0 3px #fff, 0 0 0 5px rgba(255,255,255,0.3)"
                                      : "0 0 0 1.5px rgba(255,255,255,0.2)",
                                  transform:
                                    activeFilterId === filter.id
                                      ? "scale(1.12)"
                                      : "scale(1)",
                                }}
                              />
                              <span
                                className="text-xs font-medium leading-tight"
                                style={{
                                  color:
                                    activeFilterId === filter.id
                                      ? "#fff"
                                      : "rgba(255,255,255,0.55)",
                                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                                }}
                              >
                                {filter.name}
                              </span>
                              <span
                                className="text-white/40"
                                style={{ fontSize: "9px" }}
                              >
                                {filter.viewCount} 👁
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Capture row */}
                <div className="flex items-center justify-center py-4 relative">
                  <motion.button
                    type="button"
                    data-ocid="camera.primary_button"
                    onPointerDown={() => setIsPressed(true)}
                    onPointerUp={() => {
                      setIsPressed(false);
                      handleCapture();
                    }}
                    animate={{ scale: isPressed ? 0.92 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    {/* Outer ring */}
                    <span
                      className="block w-20 h-20 rounded-full"
                      style={{ border: "3px solid rgba(255,255,255,0.85)" }}
                    />
                    {/* Inner circle */}
                    <span className="absolute inset-2 rounded-full bg-white" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            /* ═══════════════ POST-CAPTURE VIEW ═══════════════ */
            <>
              <img
                src={capturedImage}
                alt="Captured"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Top bar */}
              <div className="absolute top-0 inset-x-0 z-20 flex items-start justify-between px-4 pt-10 pb-4">
                <button
                  type="button"
                  data-ocid="camera.close_button"
                  onClick={handleClose}
                  className="w-11 h-11 flex items-center justify-center rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <X className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  data-ocid="camera.retake.button"
                  onClick={() => setCapturedImage(null)}
                  className="px-4 py-2 rounded-full text-white text-sm font-semibold"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  Retake
                </button>
              </div>

              {/* Post-capture bottom bar */}
              <div
                className="absolute bottom-0 inset-x-0 z-20 px-4 pb-10 pt-6"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Save */}
                  <motion.button
                    type="button"
                    data-ocid="camera.save.button"
                    onClick={handleSave}
                    whileTap={{ scale: 0.94 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Save
                  </motion.button>

                  {/* Story */}
                  <motion.button
                    type="button"
                    data-ocid="camera.story.button"
                    onClick={() => toast.success("Added to Story! 📖")}
                    whileTap={{ scale: 0.94 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Story
                  </motion.button>

                  {/* Reel */}
                  <motion.button
                    type="button"
                    data-ocid="camera.reel.button"
                    onClick={() => toast.success("Shared to Reels! 🎬")}
                    whileTap={{ scale: 0.94 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
                      color: "white",
                      boxShadow: "0 4px 20px rgba(249,83,198,0.4)",
                    }}
                  >
                    <Film className="w-4 h-4" />
                    Reel
                  </motion.button>
                </div>
              </div>
            </>
          )}

          {/* Hidden canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
