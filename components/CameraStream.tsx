
import React, { useEffect, useRef } from 'react';

interface CameraStreamProps {
  isActive: boolean;
}

export const CameraStream: React.FC<CameraStreamProps> = ({ isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };

    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-red-500 shadow-lg shadow-red-500/20 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover grayscale contrast-125 opacity-80"
      />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
        <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">Cloud Recording Active</span>
      </div>
      <div className="absolute bottom-3 right-3">
        <span className="text-[10px] font-mono text-white/60">EV-GANGEL-0922</span>
      </div>
      <div className="absolute inset-0 border-[20px] border-transparent pointer-events-none box-border flex items-center justify-center">
         <div className="w-full h-full border border-white/10 rounded-sm"></div>
      </div>
    </div>
  );
};
