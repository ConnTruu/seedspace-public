import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import burstLogo from './assets/burst_logo.png';
import oneLogo from './assets/one_logo.png';
import portLogo from './assets/port_logo.png';
import seedLogo from './assets/seed_logo.png';
import virusLogo from './assets/virus_logo.png';

interface StarBackgroundProps {
  scrollY: number;
}

interface Star {
  id: number;
  size: number;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  logoIndex: number;
  isStationary: boolean;
  logoScaleFactor: number;
}

// Logo-specific scaling factors - made reusable
const LOGO_SCALE_FACTORS = {
  0: 1.2,     // burstLogo
  1: 0.85,    // one_logo
  2: 1.9,     // port_logo
  3: 1.25,    // seedLogo
  4: 1.15     // virusLogo
};

const StarBackground: React.FC<StarBackgroundProps> = ({ scrollY }) => {
  // Collection of PNG logo assets
  const starLogos = [burstLogo, oneLogo, portLogo, seedLogo, virusLogo];
  
  // Check if we're in light mode to apply inversion
  const colorMode = useColorModeValue('light', 'dark');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track viewport dimensions for proper star distribution
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  
  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial measurement
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optimize star rendering by limiting the total number for better performance
  const totalStars = 350;
  
  // Create a virtual space taller than the viewport to ensure stars are distributed everywhere
  const virtualHeightScale = 1.5;

  // Generate random stars with optimized properties
  const stars = useMemo(() => {
    // Helper functions for star creation
    const getStarDepth = (index: number, isLargeStar: boolean) => {
      if (isLargeStar) {
        // Large stars - position at various close depths
        const starIndex = index % 15; // 0-14
        const baseDepth = 0.01;
        const maxDepthVariation = 0.12;
        // Create a non-linear distribution to ensure varied depths
        let depth = baseDepth + (Math.pow(starIndex / 14, 1.5) * maxDepthVariation);
        // Add some randomization to avoid uniform depths
        return depth + (Math.random() * 0.02) - 0.01; // ±0.01 variation
      } else if (index < totalStars * 0.1) {
        // Closest 10% of regular stars (after the large ones)
        const percentileInGroup = (index - 15) / (totalStars * 0.1 - 15);
        return 0.08 + (percentileInGroup * 0.12) + (Math.random() * 0.05);
      } else {
        // Remaining 90% of stars
        return 0.2 + (Math.random() * 0.7); // 0.2-0.9 range
      }
    };

    const getStarSize = (depth: number, isLargeStar: boolean) => {
      if (isLargeStar) {
        // Large stars with strong parallax movement
        return 10 + (Math.random() * 12); // 10-22px
      } else if (depth < 0.15) {
        return 5 + (Math.random() * 3);
      } else if (depth < 0.25) {
        return 4 + (Math.random() * 2);
      } else if (depth < 0.4) {
        return 3 + (Math.random() * 1.5);
      } else if (depth < 0.6) {
        return 2 + (Math.random() * 1);
      } else if (depth < 0.8) {
        return 1.5 + (Math.random() * 0.8);
      } else {
        return 1 + (Math.random() * 0.5);
      }
    };

    const getStarSpeed = (depth: number, isLargeStar: boolean, isStationary: boolean) => {
      if (isStationary) {
        return 0;
      } else if (isLargeStar) {
        // Large stars have very strong parallax effect
        const baseSpeed = 0.06;
        const depthFactor = (0.12 - depth) / 0.12; // 0-1 range, higher for closer stars
        return baseSpeed + (depthFactor * 0.04) + (Math.random() * 0.02);
      } else if (depth < 0.15) {
        return 0.07 + (Math.random() * 0.03);
      } else if (depth < 0.3) {
        return 0.05 + (Math.random() * 0.02);
      } else {
        // Regular stars with more exponential falloff for dramatic effect
        const maxSpeed = 0.05;
        return maxSpeed * Math.pow(1 - depth, 1.3) * (0.85 + Math.random() * 0.3);
      }
    };

    const getStarOpacity = (depth: number, isLargeStar: boolean) => {
      if (isLargeStar) {
        return 0.7 + (Math.random() * 0.2); // 0.7-0.9
      } else if (depth < 0.3) {
        return 0.5 + (Math.random() * 0.2);
      } else if (depth < 0.6) {
        return 0.4 + (Math.random() * 0.2);
      } else {
        return 0.2 + (Math.random() * 0.2);
      }
    };

    // Create stars array with memoization to prevent regeneration
    return Array(totalStars).fill(0).map((_, index) => {
      // Determine star properties based on its position in the array
      const isLargeStar = index < 15; // First 15 stars are large
      
      // Calculate properties using helper functions
      const depth = getStarDepth(index, isLargeStar);
      const logoIndex = Math.floor(Math.random() * starLogos.length);
      const size = getStarSize(depth, isLargeStar);
      
      // Only the most distant stars are stationary (depth > 0.9)
      // Large stars are NEVER stationary
      const isStationary = !isLargeStar && depth > 0.9;
      
      // Calculate other properties
      const speed = getStarSpeed(depth, isLargeStar, isStationary);
      const opacity = getStarOpacity(depth, isLargeStar);
      
      // Distribute stars more evenly over a virtual space
      const x = Math.random() * 100;
      const y = Math.random() * 100 * virtualHeightScale;
      
      return {
        id: index,
        size,
        x,
        y,
        speed,
        opacity,
        logoIndex,
        isStationary,
        logoScaleFactor: LOGO_SCALE_FACTORS[logoIndex as keyof typeof LOGO_SCALE_FACTORS] || 1.0
      };
    });
  }, []); // Empty dependency array ensures stars are created only once

  // Memoize style creation for better performance
  const getStarStyle = useCallback((star: Star, scrollY: number) => {
    // Enhanced parallax effect based on scroll position
    const parallaxY = star.isStationary ? 0 : -scrollY * star.speed;
    
    // Calculate the effective y position with wrapping to create an infinite scrolling effect
    const virtualHeight = viewportHeight * virtualHeightScale;
    
    // Get the base position (original % position converted to pixels)
    let yPos = (star.y / 100) * virtualHeight;
    
    // Apply parallax movement
    yPos += parallaxY;
    
    // Apply wrapping to create infinite scroll effect
    const margin = star.size * 2;
    
    if (yPos < -margin) {
      yPos = virtualHeight + (yPos % virtualHeight);
    } else if (yPos > virtualHeight + margin) {
      yPos = yPos % virtualHeight;
    }
    
    // Convert back to percentage for positioning
    const wrappedYPercent = (yPos / virtualHeight) * 100;
    
    return {
      position: 'absolute',
      left: `${star.x}%`,
      top: `${wrappedYPercent}%`,
      width: `${star.size * star.logoScaleFactor}px`,
      height: `${star.size * star.logoScaleFactor}px`,
      backgroundImage: `url(${starLogos[star.logoIndex]})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: star.opacity,
      transform: 'translate(-50%, -50%)',
      filter: colorMode === 'light' ? 'invert(1)' : 'none',
      zIndex: star.size > 8 ? 3 : 2
    } as React.CSSProperties;
  }, [colorMode, starLogos, viewportHeight, virtualHeightScale]);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex="0"
      overflow="hidden"
      ref={containerRef}
      pointerEvents="none"
    >
      {stars.map((star) => (
        <div
          key={`star-${star.id}`}
          style={getStarStyle(star, scrollY)}
        />
      ))}
    </Box>
  );
};

export default React.memo(StarBackground); 