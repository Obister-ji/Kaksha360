import { useState, useEffect } from 'react';

// Define breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof typeof breakpoints;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Update device type
      setIsMobile(window.innerWidth < breakpoints.md);
      setIsTablet(window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg);
      setIsDesktop(window.innerWidth >= breakpoints.lg);
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  // Check if the current window width is less than the given breakpoint
  const isBelow = (breakpoint: Breakpoint) => windowSize.width < breakpoints[breakpoint];
  
  // Check if the current window width is greater than or equal to the given breakpoint
  const isAbove = (breakpoint: Breakpoint) => windowSize.width >= breakpoints[breakpoint];
  
  // Check if the current window width is between the given breakpoints
  const isBetween = (minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint) => 
    windowSize.width >= breakpoints[minBreakpoint] && windowSize.width < breakpoints[maxBreakpoint];

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isBelow,
    isAbove,
    isBetween,
    breakpoints,
  };
}

// For use outside of React components
export function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop'; // Default for SSR
  
  const width = window.innerWidth;
  
  if (width < breakpoints.md) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  return 'desktop';
}

export default useResponsive;
