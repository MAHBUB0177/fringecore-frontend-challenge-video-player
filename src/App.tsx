import React, { useRef, useState, useEffect } from "react";

const App = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Default position = right middle (x=260, y=150)
  const DEFAULT_POS = { x: 260, y: 150 };

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>(DEFAULT_POS);

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.pause() : video.play();
  };

  // Track progress
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    }
  };

  // Reset when ended
  const handleEnded = () => setIsPlaying(false);

  // Sync play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // Rounded-square path
  const pathData = `
  M 150 40
  H 240
  Q 260 40 260 60
  V 240
  Q 260 260 240 260
  H 60
  Q 40 260 40 240
  V 60
  Q 40 40 60 40
  H 150
  Z
  `;

  // Path length (approximation)
  const perimeter = 4 * (220 - 20 * 2) + 2 * Math.PI * 20;
  const strokeDashoffset = perimeter - (progress / 100) * perimeter;

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  //  On mouse leave → go back to right middle
  const handleMouseLeave = () => setHoverPos(DEFAULT_POS);

  // SEEK
  const handleSeek = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    const video = videoRef.current;
    if (!svg || !video || !video.duration) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const angle =
      (Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 360 + 90) % 360;

    const percent = angle / 360;
    const newTime = percent * video.duration;
    video.currentTime = newTime;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#C9CED4]">
      <div className="relative w-[300px] h-[300px] flex justify-center items-center">
        {/* SVG Border */}
        <svg
          ref={svgRef}
          viewBox="0 0 300 300"
          className="absolute w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleSeek}
        >
          {/* Base border */}
          <path
            d={pathData}
            stroke="#E5E7EB"
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
          />

          {/* Progress border */}
          {(isPlaying || progress > 0) && (
            <path
              d={pathData}
              stroke="red"
              strokeWidth="30"
              fill="none"
              strokeLinecap="square"
              strokeDasharray={perimeter}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dashoffset 0.1s linear",
              }}
            />
          )}
        </svg>

        {/*  Hover indicator (starts at right middle) */}
        {hoverPos && (
          <div
            className="absolute bg-yellow-400 rounded-md transition-all duration-100 ease-linear"
            style={{
              width: "20px",
              height: "20px",
              left: hoverPos.x - 10,
              top: hoverPos.y - 10,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Video */}
        <div className="relative w-[190px] h-[190px] rounded-[6px] overflow-hidden bg-black shadow-lg group">
          <video
            ref={videoRef}
            src="/demo.mp4"
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center text-white text-xl 
               bg-black/30 hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
