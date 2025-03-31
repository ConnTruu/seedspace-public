import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, useColorModeValue, keyframes } from '@chakra-ui/react';
import burstLogo from './assets/burst_logo.png';
import oneLogo from './assets/one_logo.png';
import portLogo from './assets/port_logo.png';
import seedLogo from './assets/seed_logo.png';
import virusLogo from './assets/virus_logo.png';

interface ConstellationHeroProps {
  width?: string | number | Record<string, any>;
  height?: string | number | Record<string, any>;
}

interface ConstellationStar {
  id: number;
  x: number;
  y: number;
  logoIndex: number;
  connections: number[];
  size: number;
  tier: number; // 1 = primary stars, 2 = secondary stars, 3 = tertiary stars
  twinkleDelay?: number; // Add delay for twinkling effect variation
}

// Define an interface for the connection object
interface ConnectionLine {
  source: number;
  target: number;
  distance: number;
}

// Animation timing constants for consistency
const FADE_IN_DURATION = 400; // ms
const FADE_OUT_DURATION = 6000; // ms

// Define SVG filters for reuse
const SvgFilters = () => (
  <defs>
    {/* Softer glow filters for thinner cream-colored lines */}
    <filter id="glow-line-strong" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 1
                0 1 0 0 1
                0 0 1 0 0.9
                0 0 0 1 0"
        result="warm-glow"
      />
      <feComposite in="SourceGraphic" in2="warm-glow" operator="over" />
    </filter>
    <filter id="glow-line-medium" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 1
                0 1 0 0 0.99
                0 0 1 0 0.8
                0 0 0 1 0"
        result="warm-glow"
      />
      <feComposite in="SourceGraphic" in2="warm-glow" operator="over" />
    </filter>
    <filter id="glow-line-subtle" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1" result="blur" />
      <feColorMatrix
        in="blur"
        type="matrix"
        values="1 0 0 0 1
                0 1 0 0 0.98
                0 0 1 0 0.7
                0 0 0 1 0"
        result="warm-glow"
      />
      <feComposite in="SourceGraphic" in2="warm-glow" operator="over" />
    </filter>
  </defs>
);

// Helper functions for star generation
const addRandomness = (baseValue: number, range: number = 10) => {
  // Add random offset within range while keeping within 0-100 bounds
  const randomOffset = (Math.random() * range) - (range / 2);
  return Math.max(0, Math.min(100, baseValue + randomOffset));
};

const getRandomPosition = () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  logoIndex: Math.floor(Math.random() * 5),
  size: 10 + Math.random() * 8,
  tier: 3,
  twinkleDelay: Math.random()
});

// Connection rendering component
const ConnectionRender: React.FC<{
  connection: {
    source: number;
    target: number;
    distance: number;
    id?: string;
    startTime?: number;
    opacity?: number;
  };
  constellationStars: ConstellationStar[];
  getStarPosition: (star: ConstellationStar) => { x: number; y: number };
  lineColor: string;
  lineActiveColor: string;
  isFading?: boolean;
  currentTime?: number;
}> = ({
  connection,
  constellationStars,
  getStarPosition,
  lineColor,
  lineActiveColor,
  isFading = false,
  currentTime = 0
}) => {
  if (!connection) return null;
  
  const sourceStar = constellationStars[connection.source];
  const targetStar = constellationStars[connection.target];
  
  const sourcePos = getStarPosition(sourceStar);
  const targetPos = getStarPosition(targetStar);
  
  // Calculate line thickness based on distance from hovered/clicked star - make thinner
  const baseThickness = Math.max(
    1.6 - Math.min(sourceStar.tier, targetStar.tier),
    0.5
  );
  
  // Line properties based on distance
  let thickness, baseOpacity, glowFilter, color;
  
  if (connection.distance === 0) {
    // Direct connections - strongest
    thickness = baseThickness * 1.1;
    baseOpacity = 0.9;
    glowFilter = "url(#glow-line-strong)";
    color = lineActiveColor;
  } else if (connection.distance === 1) {
    // One hop away - medium
    thickness = baseThickness * 0.9;
    baseOpacity = 0.75;
    glowFilter = "url(#glow-line-medium)";
    color = lineColor;
  } else {
    // Two+ hops away - subtle
    thickness = baseThickness * 0.7;
    baseOpacity = 0.6;
    glowFilter = "url(#glow-line-subtle)";
    color = lineColor;
  }
  
  // Calculate current opacity for fading connections
  let currentOpacity = baseOpacity;
  
  if (isFading && connection.startTime) {
    const elapsedTime = currentTime - connection.startTime;
    const progress = Math.min(elapsedTime / FADE_OUT_DURATION, 1);
    
    // Use a cubic ease-out function for more noticeable fading
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    currentOpacity = (connection.opacity || baseOpacity) * (1 - easedProgress);
  }
  
  // Create a unique key for this connection
  const connectionKey = isFading 
    ? connection.id || `fading-${connection.source}-${connection.target}` 
    : `active-${connection.source}-${connection.target}`;
  
  return (
    <line
      key={connectionKey}
      x1={sourcePos.x}
      y1={sourcePos.y}
      x2={targetPos.x}
      y2={targetPos.y}
      stroke={color}
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeOpacity={currentOpacity}
      filter={glowFilter}
    />
  );
};

const ConstellationHero: React.FC<ConstellationHeroProps> = ({
  width = "100%",
  height = "100%"
}) => {
  // Collection of PNG logo assets
  const starLogos = [burstLogo, oneLogo, portLogo, seedLogo, virusLogo];
  
  // Check if we're in light mode to apply inversion
  const colorMode = useColorModeValue('light', 'dark');
  // Change line colors to a cream color (#FFFBF2) with different opacity for regular and active states
  const lineColor = useColorModeValue('rgba(100, 90, 70, 0.25)', 'rgba(255, 251, 242, 0.25)');
  const lineActiveColor = useColorModeValue('rgba(80, 70, 50, 0.6)', 'rgba(255, 251, 242, 0.6)');
  const bgColor = useColorModeValue(
    'rgba(255, 251, 242, 0.5)', 
    'rgba(0, 0, 17, 0.5)'
  );
  
  // Define animations with chakra's keyframes
  const pulseAnimation = keyframes`
    0% { transform: translate(-50%, -50%) scale(1); filter: var(--base-filter) drop-shadow(0 0 5px var(--glow-color)); }
    50% { transform: translate(-50%, -50%) scale(1.05); filter: var(--base-filter) drop-shadow(0 0 8px var(--glow-color)); }
    100% { transform: translate(-50%, -50%) scale(1); filter: var(--base-filter) drop-shadow(0 0 5px var(--glow-color)); }
  `;

  // State for interactive elements
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [clickedStar, setClickedStar] = useState<number | null>(null);
  const [showAllConnections, setShowAllConnections] = useState(false);
  
  // Redesigned animation state system
  const [fadingConnections, setFadingConnections] = useState<Array<{
    id: string;
    source: number; 
    target: number;
    distance: number;
    startTime: number;
    opacity: number;
  }>>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Add a forceRender hook to ensure smooth animation updates
  const [, forceRender] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Use requestAnimationFrame to ensure smooth fading animation
  useEffect(() => {
    // Only run animation loop if we have connections that are fading
    if (fadingConnections.length === 0) return;
    
    let animationFrameId: number;
    
    const animateFrame = () => {
      // Update current time for opacity calculations
      setCurrentTime(Date.now());
      
      // Force a re-render to update the opacity calculations
      forceRender(prev => prev + 1);
      
      // Continue the animation loop
      animationFrameId = requestAnimationFrame(animateFrame);
    };
    
    // Start the animation loop
    animationFrameId = requestAnimationFrame(animateFrame);
    
    // Clean up
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [fadingConnections.length]);

  // Create constellation stars with a larger, more complex layout
  const constellationStars = React.useMemo(() => {
    // More complex constellation layout with primary, secondary and tertiary stars
    // Expanded to use the entire available space (0-100%)
    const starsConfig: Partial<ConstellationStar>[] = [
      // Primary stars - Core constellation (fully expanded layout with randomness)
      { x: addRandomness(5, 10), y: addRandomness(5, 10), logoIndex: 0, size: 28, tier: 1, twinkleDelay: 0 },     // Top left - burst
      { x: addRandomness(18, 15), y: addRandomness(25, 15), logoIndex: 3, size: 32, tier: 1, twinkleDelay: 0.1 }, // Middle left - seed
      { x: addRandomness(30, 12), y: addRandomness(90, 10), logoIndex: 4, size: 30, tier: 1, twinkleDelay: 0.2 },   // Bottom middle - virus
      { x: addRandomness(82, 10), y: addRandomness(92, 8), logoIndex: 1, size: 30, tier: 1, twinkleDelay: 0.3 }, // Bottom right - one
      { x: addRandomness(95, 10), y: addRandomness(10, 10), logoIndex: 2, size: 34, tier: 1, twinkleDelay: 0.4 },   // Top right - port
      { x: addRandomness(75, 12), y: addRandomness(4, 8), logoIndex: 0, size: 26, tier: 1, twinkleDelay: 0.5 },  // Top middle - burst
      { x: addRandomness(48, 10), y: addRandomness(35, 12), logoIndex: 3, size: 28, tier: 1, twinkleDelay: 0.6 },   // Center - seed
      
      // Secondary stars - Add depth to the constellation (with randomness)
      { x: addRandomness(12, 15), y: addRandomness(15, 15), logoIndex: 4, size: 22, tier: 2, twinkleDelay: 0.15 }, // Between 0 and 1
      { x: addRandomness(25, 18), y: addRandomness(65, 15), logoIndex: 2, size: 24, tier: 2, twinkleDelay: 0.25 }, // Between 1 and 2
      { x: addRandomness(58, 15), y: addRandomness(85, 12), logoIndex: 0, size: 20, tier: 2, twinkleDelay: 0.35 }, // Between 2 and 3
      { x: addRandomness(87, 12), y: addRandomness(45, 18), logoIndex: 1, size: 22, tier: 2, twinkleDelay: 0.45 }, // Between 3 and 4
      { x: addRandomness(88, 10), y: addRandomness(8, 12), logoIndex: 3, size: 24, tier: 2, twinkleDelay: 0.55 }, // Between 4 and 5
      { x: addRandomness(60, 15), y: addRandomness(8, 10), logoIndex: 4, size: 22, tier: 2, twinkleDelay: 0.65 },  // Between 5 and 6
      { x: addRandomness(28, 15), y: addRandomness(10, 15), logoIndex: 2, size: 20, tier: 2, twinkleDelay: 0.75 }, // Between 6 and 0
      { x: addRandomness(70, 15), y: addRandomness(55, 12), logoIndex: 0, size: 22, tier: 2, twinkleDelay: 0.85 }, // Right of 6
      { x: addRandomness(35, 15), y: addRandomness(40, 18), logoIndex: 1, size: 18, tier: 2, twinkleDelay: 0.95 }, // Left of 6
      
      // Tertiary stars - positioned at extremes (with randomness)
      { x: addRandomness(2, 5), y: addRandomness(20, 20), logoIndex: 3, size: 14, tier: 3, twinkleDelay: 0.05 },   // Far left
      { x: addRandomness(5, 10), y: addRandomness(55, 18), logoIndex: 2, size: 16, tier: 3, twinkleDelay: 0.15 },  // Left-middle
      { x: addRandomness(15, 12), y: addRandomness(90, 12), logoIndex: 0, size: 15, tier: 3, twinkleDelay: 0.25 }, // Bottom-left
      { x: addRandomness(50, 20), y: addRandomness(95, 8), logoIndex: 1, size: 14, tier: 3, twinkleDelay: 0.35 }, // Bottom center
      { x: addRandomness(92, 10), y: addRandomness(82, 15), logoIndex: 3, size: 16, tier: 3, twinkleDelay: 0.45 }, // Bottom-right
      { x: addRandomness(95, 5), y: addRandomness(35, 20), logoIndex: 4, size: 15, tier: 3, twinkleDelay: 0.55 }, // Far right
      { x: addRandomness(95, 10), y: addRandomness(5, 10), logoIndex: 2, size: 14, tier: 3, twinkleDelay: 0.65 },  // Top-right corner
      
      // Add additional completely random stars for more natural distribution
      getRandomPosition(),
      getRandomPosition(),
      getRandomPosition(),
      getRandomPosition(),
      getRandomPosition(),
      getRandomPosition(),
      getRandomPosition(),
      getRandomPosition(),
    ];

    // Create stars with IDs and initialize connections array
    const stars: ConstellationStar[] = starsConfig.map((config, index) => ({
      id: index,
      x: config.x || 50,
      y: config.y || 50,
      logoIndex: config.logoIndex || 0,
      connections: [],
      size: config.size || 20,
      tier: config.tier || 1,
      twinkleDelay: config.twinkleDelay || 0
    }));

    // Define connection maps for different star tiers
    const connectionMaps: number[][][] = [
      // Primary star connections (0-6)
      [
        [1, 2, 6, 7, 10],           // 0: Top left
        [0, 2, 3, 6, 8, 15],        // 1: Middle left
        [0, 1, 3, 6, 8, 9],         // 2: Bottom middle
        [1, 2, 4, 5, 9, 10],        // 3: Bottom right
        [3, 5, 6, 10, 11, 14],      // 4: Top right
        [3, 4, 6, 11, 12, 13],      // 5: Top middle
        [0, 1, 2, 4, 5, 13, 15]     // 6: Center
      ],
      
      // Secondary star connections (7-15)
      [
        [0, 1, 16],                 // 7: Between 0 and 1
        [1, 2, 9, 17],              // 8: Between 1 and 2
        [2, 3, 8, 18, 19],          // 9: Between 2 and 3
        [0, 3, 4, 20],              // 10: Between 3 and 4
        [4, 5, 20, 21],             // 11: Between 4 and 5
        [5, 6, 13, 22],             // 12: Between 5 and 6
        [5, 6, 12, 14],             // 13: Between 6 and 0
        [4, 13, 21],                // 14: Right of 6
        [1, 6, 7, 16]               // 15: Left of 6
      ],
      
      // Tertiary star connections (16-22)
      [
        [7, 15, 17],                // 16: Outer left
        [8, 16, 18],                // 17: Outer left-bottom
        [9, 17, 19],                // 18: Outer bottom-left
        [9, 18, 20],                // 19: Outer bottom
        [10, 11, 19, 21],           // 20: Outer bottom-right
        [11, 14, 20, 22],           // 21: Outer right
        [12, 13, 21]                // 22: Outer top-right
      ]
    ];
    
    // Generate 8 random connections for the random stars
    const randomConnections: number[][] = Array(8).fill(0).map(() => {
      const randomPrimary = Math.floor(Math.random() * 7); // 0-6 (primary stars)
      const randomSecondary = Math.floor(Math.random() * 9) + 7; // 7-15 (secondary stars)
      return [randomPrimary, randomSecondary];
    });

    // Combine all connection maps
    const allConnectionMaps = [...connectionMaps, randomConnections];
    
    // Flatten connection maps and add connections to stars
    const allConnections = allConnectionMaps.flat();
    stars.forEach((star, index) => {
      star.connections = allConnections[index] || [];
    });

    return stars;
  }, []);

  // Handle clicking on constellation star
  const handleStarClick = useCallback((starId: number) => {
    // Toggle clicked state
    if (clickedStar === starId) {
      setClickedStar(null);
      setShowAllConnections(false);
    } else {
      setClickedStar(starId);
      setShowAllConnections(true);
    }
  }, [clickedStar]);

  // Calculate SVG viewBox based on container size for responsive star connections
  const [svgViewBox, setSvgViewBox] = useState("0 0 100 100");
  
  useEffect(() => {
    const updateSvgViewBox = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setSvgViewBox(`0 0 ${width} ${height}`);
      }
    };

    // Initialize viewBox and set up resize observer
    updateSvgViewBox();
    
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) updateSvgViewBox();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Also listen for window resize as a fallback
    window.addEventListener('resize', updateSvgViewBox);
    
    // Update on a short delay after initial render to ensure all dimensions are settled
    const timeoutId = setTimeout(updateSvgViewBox, 500);
    
    return () => {
      window.removeEventListener('resize', updateSvgViewBox);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Calculate viewport-relative positions for SVG lines
  const getStarPosition = useCallback((star: ConstellationStar) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Ensure positions are calculated correctly by using the same percentage-based
    // approach for both stars and lines, rather than absolute positioning
    return {
      x: (star.x / 100) * width,
      y: (star.y / 100) * height
    };
  }, []);

  // Helper function to get connections for a specific star
  const getVisibleConnectionsForStar = useCallback((starId: number | null): ConnectionLine[] => {
    if (starId === null || !containerRef.current) return [];
    
    // Get direct connections for the star
    return constellationStars[starId].connections
      .slice(0, 4)
      .map(targetId => ({
        source: starId,
        target: targetId,
        distance: 0
      }) as ConnectionLine);
  }, [constellationStars]);

  // Handle hovering over constellation star
  const handleStarHover = useCallback((starId: number | null) => {
    if (starId === null) {
      // On hover end, add the currently visible connections to the fading set
      if (hoveredStar !== null) {
        const currentTime = Date.now();
        
        // Get connections that are currently active for this star
        const connectionsToFade = getVisibleConnectionsForStar(hoveredStar);
        
        // Add each connection to fading set with a unique ID
        const newFadingConnections = connectionsToFade.map(conn => {
          // Generate a unique ID for this specific animation instance
          const uniqueId = `fade-${conn.source}-${conn.target}-${currentTime}`;
          
          // Determine base opacity based on connection distance
          let opacity = 0.9; // Default for direct connections
          
          if (conn.distance === 1) {
            opacity = 0.75;
          } else if (conn.distance > 1) {
            opacity = 0.6;
          }
          
          return {
            id: uniqueId,
            source: conn.source,
            target: conn.target,
            distance: conn.distance,
            startTime: currentTime,
            opacity: opacity
          };
        });
        
        // Add these new fading connections to the state
        setFadingConnections(prev => [...prev, ...newFadingConnections]);
        
        // Set a single timer to clean up animations that have completed
        if (newFadingConnections.length > 0) {
          setTimeout(() => {
            const cutoffTime = Date.now() - FADE_OUT_DURATION;
            setFadingConnections(prev => 
              prev.filter(conn => conn.startTime > cutoffTime)
            );
          }, FADE_OUT_DURATION + 100); // Add a slight buffer to ensure animation completes
        }
      }
      
      // Clear hovered star state
      setHoveredStar(null);
    } else {
      // On hover start, just set the new hovered star
      setHoveredStar(starId);
    }
  }, [hoveredStar, getVisibleConnectionsForStar]);

  // Determine which connections to show
  const getVisibleConnections = useCallback(() => {
    if (!containerRef.current) return [] as ConnectionLine[];
    
    // Get all connections based on hover/click state
    let connections: ConnectionLine[] = [];
    
    if (showAllConnections && clickedStar !== null) {
      // When a star is clicked, only show its direct connections
      const directConnections = constellationStars[clickedStar].connections.map(targetId => ({
        source: clickedStar,
        target: targetId,
        distance: 0 // Direct connection
      }) as ConnectionLine);
      
      // Only add one level of secondary connections if the clicked star is a primary star (tier 1)
      let secondaryConnections: ConnectionLine[] = [];
      if (constellationStars[clickedStar].tier === 1) {
        secondaryConnections = constellationStars[clickedStar].connections
          .slice(0, 4)
          .flatMap(targetId => {
            return constellationStars[targetId].connections
              .filter(secondaryId => 
                secondaryId !== clickedStar && // Not back to the clicked star
                !constellationStars[clickedStar].connections.includes(secondaryId) // Not already a direct connection
              )
              .slice(0, 3)
              .map(secondaryId => ({
                source: targetId,
                target: secondaryId,
                distance: 1 // One hop away
              }) as ConnectionLine);
          });
      }
      
      connections = [...directConnections, ...secondaryConnections];
    } else if (hoveredStar !== null) {
      // On hover, show direct connections
      connections = getVisibleConnectionsForStar(hoveredStar);
    }
    
    return connections;
  }, [hoveredStar, clickedStar, showAllConnections, constellationStars, containerRef, getVisibleConnectionsForStar]);

  // Currently visible (active) connections for current hover/click state
  const activeConnections = getVisibleConnections();
  
  // Add CSS for animations with @keyframes and transitions
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.type = 'text/css';
    
    // Define twinkling animations with brighter minimum values
    style.innerHTML = `
      /* Twinkling effect for primary stars - brighter minimum */
      @keyframes twinkle-primary {
        0%, 100% { opacity: 0.4; }  /* Much brighter minimum */
        50% { opacity: 1; }          /* Full brightness */
      }
      
      /* Less dramatic for secondary stars */
      @keyframes twinkle-secondary {
        0%, 100% { opacity: 0.5; }  /* Brighter minimum */
        50% { opacity: 0.95; }
      }
      
      /* Subtle twinkling for tertiary stars */
      @keyframes twinkle-tertiary {
        0%, 100% { opacity: 0.6; }  /* Even brighter minimum */
        50% { opacity: 0.9; }
      }
      
      /* Pulse animation for hovered stars */
      @keyframes pulse-hover {
        0% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.08); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      
      /* Animation class definitions - slowed down */
      .twinkle-primary {
        animation: twinkle-primary 1s ease-in-out infinite;
        will-change: opacity;
      }
      
      .twinkle-secondary {
        animation: twinkle-secondary 1.2s ease-in-out infinite;
        will-change: opacity;
      }
      
      .twinkle-tertiary {
        animation: twinkle-tertiary 1.4s ease-in-out infinite;
        will-change: opacity;
      }
      
      .pulse-hover {
        animation: pulse-hover 1.5s ease-in-out infinite;
        will-change: transform;
      }
    `;
    
    // Add style element to head
    document.head.appendChild(style);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render a constellation star
  const renderStar = (star: ConstellationStar) => {
    const starLogo = starLogos[star.logoIndex];
    
    // Determine if star is active
    const isHovered = hoveredStar === star.id;
    const isClicked = clickedStar === star.id;
    const isConnectedToClicked = clickedStar !== null && 
                               constellationStars[clickedStar].connections.includes(star.id);
    const isActive = isHovered || isClicked || isConnectedToClicked;
    
    // Base filter (for inversion in light mode)
    const baseFilter = colorMode === 'light' ? 'invert(1)' : 'none';
    
    // Size scaling based on state
    const sizeScale = isHovered ? 1.15 : isActive ? 1.05 : 1;
    const displaySize = star.size * sizeScale;
    
    // Z-index by tier (higher tier = lower z-index)
    const zIndex = 5 - star.tier;
    
    // Make all stars clickable regardless of tier
    const isClickable = true;

    // Determine which CSS classes to apply for animation - now all stars twinkle
    let animationClass = '';
    
    if (isHovered) {
      animationClass = 'pulse-hover';
    } else if (star.tier === 1) {
      animationClass = 'twinkle-primary';
    } else if (star.tier === 2) {
      animationClass = 'twinkle-secondary';
    } else if (star.tier === 3) {
      animationClass = 'twinkle-tertiary';
    }
    
    return (
      <div
        key={`constellation-star-${star.id}`}
        className={animationClass}
        style={{
          position: 'absolute',
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: `${displaySize}px`,
          height: `${displaySize}px`,
          backgroundImage: `url(${starLogo})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'translate(-50%, -50%)',
          filter: baseFilter,
          zIndex,
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'width 0.2s ease, height 0.2s ease',
          animationDelay: `${star.twinkleDelay}s`,
        }}
        onMouseEnter={() => isClickable && handleStarHover(star.id)}
        onMouseLeave={() => isClickable && handleStarHover(null)}
        onClick={() => isClickable && handleStarClick(star.id)}
      />
    );
  };

  return (
    <Box 
      position="absolute"
      height={height}
      width={width}
      top="0"
      left="0"
      right="0"
      bottom="0"
      margin="0"
      padding="0"
      ref={containerRef}
      zIndex="1"
      sx={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        inset: 0
      }}
    >
      {/* Semi-transparent background with blur effect */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={0}
        bg={bgColor}
        borderRadius="0"
        backdropFilter="blur(6px)"
        _groupHover={{ backdropFilter: "blur(8px)" }}
        transition="backdrop-filter 0.3s ease"
      />

      {/* SVG for constellation lines */}
      <svg 
        width="100%" 
        height="100%" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          overflow: 'visible'
        }}
        viewBox={svgViewBox}
        preserveAspectRatio="none"
      >
        <SvgFilters />
      
        {/* Active connections */}
        {activeConnections.map((connection) => (
          <ConnectionRender
            key={`active-${connection.source}-${connection.target}`}
            connection={connection}
            constellationStars={constellationStars}
            getStarPosition={getStarPosition}
            lineColor={lineColor}
            lineActiveColor={lineActiveColor}
          />
        ))}
        
        {/* Fading connections */}
        {fadingConnections.map((connection) => (
          <ConnectionRender
            key={connection.id}
            connection={connection}
            constellationStars={constellationStars}
            getStarPosition={getStarPosition}
            lineColor={lineColor}
            lineActiveColor={lineActiveColor}
            isFading={true}
            currentTime={currentTime}
          />
        ))}
      </svg>

      {/* Constellation stars */}
      {constellationStars.map(renderStar)}
    </Box>
  );
};

export default ConstellationHero; 