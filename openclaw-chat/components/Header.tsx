"use client";

interface HeaderProps {
  tokenUsage: {
    current: number;
    max: number;
    percentage: number;
    isWarning: boolean;
    isCritical: boolean;
  };
  onClear: () => void;
  isStreaming: boolean;
}

export default function Header({ tokenUsage, onClear, isStreaming }: HeaderProps) {
  return (
    <header className="header-glass">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="logo-glow">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="drop-shadow-lg"
            >
              <circle cx="16" cy="16" r="14" fill="url(#logoGrad)" opacity="0.9" />
              <path
                d="M10 16C10 12.686 12.686 10 16 10C19.314 10 22 12.686 22 16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 20C12 17.791 13.791 16 16 16C18.209 16 20 17.791 20 20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="2" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              OpenClaw AI
            </h1>
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <span className="text-xs text-gray-400">Qwen 3.5 · Local</span>
            </div>
          </div>
        </div>

        {/* Right: Token Usage + Clear */}
        <div className="flex items-center gap-4">
          {/* Token Usage Bar */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Context</span>
              <div className="token-bar-container">
                <div
                  className={`token-bar-fill ${
                    tokenUsage.isCritical
                      ? "token-critical"
                      : tokenUsage.isWarning
                      ? "token-warning"
                      : "token-normal"
                  }`}
                  style={{ width: `${tokenUsage.percentage}%` }}
                />
              </div>
              <span className="tabular-nums w-12 text-right">
                {Math.round(tokenUsage.percentage)}%
              </span>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={onClear}
            disabled={isStreaming}
            className="clear-button"
            title="ล้างแชท"
            id="clear-chat-btn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
