'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';

interface ScrollRevealProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
  className = '',
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, once]);

  const getInitialStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      opacity: 0,
      transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      transitionDelay: `${delay}ms`,
    };

    switch (animation) {
      case 'fade-up':
        return { ...base, transform: 'translateY(40px)' };
      case 'fade-down':
        return { ...base, transform: 'translateY(-40px)' };
      case 'fade-left':
        return { ...base, transform: 'translateX(40px)' };
      case 'fade-right':
        return { ...base, transform: 'translateX(-40px)' };
      case 'zoom-in':
        return { ...base, transform: 'scale(0.9)' };
      case 'fade':
      default:
        return base;
    }
  };

  const getVisibleStyles = (): React.CSSProperties => ({
    opacity: 1,
    transform: 'translateY(0) translateX(0) scale(1)',
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
    transitionDelay: `${delay}ms`,
  });

  return (
    <div
      ref={ref}
      className={className}
      style={isVisible ? getVisibleStyles() : getInitialStyles()}
    >
      {children}
    </div>
  );
}

// Staggered children animation wrapper
interface StaggerRevealProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  animation?: AnimationType;
  className?: string;
  childClassName?: string;
}

export function StaggerReveal({
  children,
  baseDelay = 0,
  staggerDelay = 100,
  animation = 'fade-up',
  className = '',
  childClassName = '',
}: StaggerRevealProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          delay={baseDelay + index * staggerDelay}
          className={childClassName}
        >
          {child}
        </ScrollReveal>
      ))}
    </div>
  );
}
