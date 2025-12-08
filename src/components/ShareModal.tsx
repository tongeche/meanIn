'use client';

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  term: string;
  meaning?: string;
  shareUrl: string;
  cardUrl?: string;
}

export function ShareModal({ isOpen, onClose, term, meaning, shareUrl }: ShareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle slide-up animation
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 4,
        backgroundColor: '#0a0a0f',
        width: 270,
        height: 480,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });
      
      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error("Failed to generate image:", error);
      return null;
    }
  };

  // Native share with image - uses system share sheet on mobile
  const handleNativeShare = async () => {
    setGenerating(true);
    
    try {
      const imageBlob = await generateImage();
      
      if (imageBlob && navigator.canShare) {
        const file = new File([imageBlob], `meanin-${term.toLowerCase().replace(/\s+/g, '-')}.png`, {
          type: 'image/png',
        });
        
        const shareData = {
          files: [file],
          title: `"${term}" decoded`,
          text: `Check out what "${term}" really means\n${shareUrl}`,
        };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setGenerating(false);
          return;
        }
      }
      
      // Fallback: share without image
      if (navigator.share) {
        await navigator.share({
          title: `"${term}" decoded`,
          text: `Check out what "${term}" really means`,
          url: shareUrl,
        });
      }
    } catch (error) {
      console.error("Share cancelled:", error);
    }
    
    setGenerating(false);
  };

  const handleWhatsAppShare = async () => {
    setGenerating(true);
    
    try {
      const imageBlob = await generateImage();
      
      if (imageBlob && navigator.canShare) {
        const file = new File([imageBlob], `meanin-${term.toLowerCase().replace(/\s+/g, '-')}.png`, {
          type: 'image/png',
        });
        
        const shareData = {
          files: [file],
          title: `"${term}" decoded`,
          text: `Check out what "${term}" really means\n${shareUrl}`,
        };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setGenerating(false);
          return;
        }
      }
      
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out what "${term}" really means\n${shareUrl}`)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Share failed:", error);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out what "${term}" really means\n${shareUrl}`)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    setGenerating(false);
  };

  const handleInstagramShare = async () => {
    setGenerating(true);
    
    try {
      const imageBlob = await generateImage();
      
      if (imageBlob) {
        if (navigator.canShare) {
          const file = new File([imageBlob], `meanin-${term.toLowerCase().replace(/\s+/g, '-')}.png`, {
            type: 'image/png',
          });
          
          const shareData = { files: [file] };
          
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            setGenerating(false);
            return;
          }
        }
        
        // Fallback: Download image
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meanin-${term.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Instagram share failed:", error);
    }
    
    setGenerating(false);
  };

  const handleDownloadImage = async () => {
    setGenerating(true);
    
    try {
      const imageBlob = await generateImage();
      
      if (imageBlob) {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meanin-${term.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
    
    setGenerating(false);
  };

  const shortUrl = shareUrl.replace(/^https?:\/\//, '').replace(/^www\./, '');

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-colors duration-300 ${
        isVisible ? 'bg-black/60' : 'bg-transparent'
      }`}
    >
      {/* Bottom Sheet on mobile, centered modal on desktop */}
      <div 
        className={`w-full sm:max-w-md bg-[var(--dropdown-bg)] border border-[var(--border-color)] shadow-2xl overflow-hidden transition-transform duration-300 ease-out
          rounded-t-3xl sm:rounded-2xl
          ${isVisible ? 'translate-y-0' : 'translate-y-full sm:translate-y-8'}
        `}
      >
        {/* Drag handle - mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[var(--text-secondary)]/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Share to Status</h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-lg active:bg-[var(--card-bg)] hover:bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Story Card Preview - Smaller on mobile */}
        <div className="px-5 py-4">
          <div 
            ref={cardRef}
            className="relative aspect-[9/16] w-full max-w-[200px] sm:max-w-[240px] mx-auto rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0a0a0f 0%, #1b1b24 100%)',
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold">
                <span className="text-white">&ldquo;</span>
                <span style={{ color: '#8B5CFF' }}>{term}</span>
                <span className="text-white">&rdquo;</span>
              </h3>
              
              {meaning && (
                <p className="text-sm sm:text-base text-white/80 leading-relaxed mt-4 sm:mt-6 italic">
                  &ldquo;{meaning}&rdquo;
                </p>
              )}
              
              <div className="absolute bottom-10 left-0 right-0 text-center">
                <p className="text-xs sm:text-sm text-white/60 mb-1">
                  Tap to see full meaning
                </p>
                <p className="text-xs text-white/40">
                  {shortUrl}
                </p>
              </div>
            </div>
            
            <div className="absolute bottom-3 right-3 text-white/30 text-base font-bold">
              FM
            </div>
          </div>
        </div>

        {/* Share Options - Larger touch targets for mobile */}
        <div className="px-5 pb-6 sm:pb-5 flex flex-col gap-3">
          {/* Primary: Native Share */}
          <button
            onClick={handleNativeShare}
            disabled={generating}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 sm:py-3 rounded-xl bg-[var(--electric-blue)] hover:bg-[#5b9eff] active:bg-[#4a8eef] text-white font-semibold transition-colors disabled:opacity-60 min-h-[52px]"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {generating ? 'Generating...' : 'Share Story Card'}
          </button>

          {/* Quick share row */}
          <div className="flex gap-3">
            <button
              onClick={handleWhatsAppShare}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-4 sm:py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1aa84d] text-white font-medium transition-colors disabled:opacity-60 min-h-[52px]"
              aria-label="Share to WhatsApp"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleInstagramShare}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-4 sm:py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-60 min-h-[52px]"
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
              aria-label="Share to Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="hidden sm:inline">Instagram</span>
            </button>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownloadImage}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-[var(--border-color)] bg-transparent hover:bg-[var(--card-bg)] active:bg-[var(--card-bg)] text-[var(--text-primary)] font-medium transition-colors disabled:opacity-60 min-h-[48px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Save</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-[var(--border-color)] bg-transparent hover:bg-[var(--card-bg)] active:bg-[var(--card-bg)] text-[var(--text-primary)] font-medium transition-colors min-h-[48px]"
            >
              {copied ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Safe area padding for iPhone notch */}
        <div className="h-[env(safe-area-inset-bottom)] bg-[var(--dropdown-bg)]" />
      </div>
    </div>
  );
}
