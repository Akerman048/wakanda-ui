import { SpriteLogo } from "../ui/icons/SpriteLogo";
import wakandaMarvel from "../../assets/marvel-theater.png";

export default function Footer() {
  const h = "clamp(18px, 2.2vw, 28px)";

  return (
    <footer className="fixed bottom-6 right-6 z-50">
      <div className="grid grid-cols-[auto_auto_1fr] items-center overflow-hidden border border-white/20 bg-black/30 backdrop-blur-md">
        {/* Left */}
        <div className="flex items-center px-4 py-2">
          <SpriteLogo style={{ height: h }} className="w-auto opacity-95" />
        </div>

        {/* Center */}
        <div className="flex items-center justify-center border-l border-white/20 px-6 py-2">
          <img
            src={wakandaMarvel}
            alt="Wakanda Forever"
            style={{ height: h }}
            className="w-auto object-contain opacity-95"
          />
        </div>

        {/* Right */}
        <div className="flex items-center justify-end border-l border-white/20 px-4 py-2 min-w-0">
  <span className="truncate text-[10px] sm:text-[11px] tracking-wide text-white/70">
    Sprite Zero Sugar® | © MARVEL
  </span>
</div>
      </div>
    </footer>
  );
}
