import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Divider,
  keyframes,
  useBreakpointValue,
  chakra,
  BoxProps
} from '@chakra-ui/react'
import { FiArrowRight, FiGitBranch, FiGitCommit, FiGitMerge } from 'react-icons/fi'
import logoImage from './assets/seedspace.svg'
// Import for our separate StarBackground component
import StarBackground from './StarBackground';
// Import the lightweight logo assets for stars with CSS background approach for use in Hero section
import seedLogo from './assets/seed_logo.png'
// Import the lightweight logo assets for stars with CSS background approach
import burstLogo from './assets/burst_logo.png'
import oneLogo from './assets/one_logo.png'
import portLogo from './assets/port_logo.png'
import virusLogo from './assets/virus_logo.png'
// Removed ivyLogo and wheelLogo imports since we're not using them

// We no longer need to import the SVG files since we'll use a font
// Add a CSS import for the icon font - you would create this file
import './assets/seedspace-icons.css'

import ConstellationHero from './ConstellationHero';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Reusable components for common UI patterns
const SectionHeading: React.FC<{
  children: React.ReactNode;
  highlight: string;
  isLoaded: boolean;
  shouldAnimate: boolean;
}> = ({ children, highlight, isLoaded, shouldAnimate }) => {
  const bgColor = useColorModeValue('rgba(255, 251, 242, 0.5)', 'rgba(0, 0, 17, 0.5)');
  const textColor = useColorModeValue('#000011', '#FFFBF2');

  return (
    <Heading 
      fontSize={{ base: '2xl', md: '3xl' }} 
      textAlign="center"
      opacity={isLoaded ? 1 : 0}
      animation={shouldAnimate ? `${fadeIn} 1s ease-out 0.6s forwards` : 'none'}
      position="relative"
      py={3}
    >
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        bg={bgColor}
        backdropFilter="blur(6px)"
        borderRadius="md"
        zIndex="-1"
      />
      <chakra.span color={textColor}>{highlight}</chakra.span> {children}
    </Heading>
  );
};

// Feature card component
const FeatureCard: React.FC<{
  icon?: React.ReactElement;
  title: string;
  description: string;
  borderColor: string;
  textColor: string;
  mutedTextColor: string;
}> = ({ icon, title, description, borderColor, textColor, mutedTextColor }) => {
  const bgColor = useColorModeValue('rgba(255, 251, 242, 0.5)', 'rgba(0, 0, 17, 0.5)');
  
  return (
    <Box
      borderTop="1px solid"
      borderColor={borderColor}
      pt={6}
      px={4}
      position="relative"
      borderRadius="md"
    >
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        bg={bgColor}
        backdropFilter="blur(6px)"
        borderRadius="md"
        zIndex="-1"
      />
      <VStack spacing={4} align="flex-start">
        {icon && (
          <Box color={textColor}>
            {icon}
          </Box>
        )}
        <Heading 
          as="h3" 
          fontSize={{ base: "xl", lg: "2xl" }}
          fontWeight="500"
        >
          {title}
        </Heading>
        <Text fontSize="sm" color={mutedTextColor} lineHeight="tall">
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

// Industry card component
const IndustryCard: React.FC<{
  title: string;
  description: string;
  borderColor: string;
  mutedTextColor: string;
}> = ({ title, description, borderColor, mutedTextColor }) => {
  const bgColor = useColorModeValue('rgba(255, 251, 242, 0.5)', 'rgba(0, 0, 17, 0.5)');
  
  return (
    <Box
      borderTop="1px solid"
      borderColor={borderColor}
      pt={6}
      px={4}
      flex="1"
      minW={{ base: '100%', md: '45%', lg: '22%' }}
      mb={8}
      position="relative"
      borderRadius="md"
    >
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        bottom="0" 
        bg={bgColor}
        backdropFilter="blur(6px)"
        borderRadius="md"
        zIndex="-1"
      />
      <VStack spacing={4} align="flex-start">
        <Heading 
          as="h3" 
          fontSize={{ base: "lg", lg: "xl" }}
          fontWeight="500"
        >
          {title}
        </Heading>
        <Text fontSize="sm" color={mutedTextColor} lineHeight="tall">
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

// Main App component with all sections
function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [virtualScrollY, setVirtualScrollY] = useState(0);
  const [isVirtualScrolling, setIsVirtualScrolling] = useState(false);
  const fullText = "Powering the next generation of AI workflows";
  
  // Animation variants for responsive design
  const shouldAnimate = useBreakpointValue({ 
    base: false,
    md: true
  }) ?? true;
  
  // Use the custom colors
  const bgColor = useColorModeValue('#FFFBF2', '#000011')
  const textColor = useColorModeValue('#000011', '#FFFBF2')
  const cardBg = useColorModeValue('rgba(0,0,0,0.03)', 'rgba(255, 251, 242, 0.05)')
  const mutedTextColor = useColorModeValue('secondary.600', 'brand.50')
  const borderColor = useColorModeValue('secondary.200', 'secondary.700')
  const glassBg = useColorModeValue('rgba(255, 251, 242, 0.5)', 'rgba(0, 0, 17, 0.5)')
  
  // Create refs to access state values inside the effect without dependencies
  const scrollYRef = useRef(scrollY);
  const virtualScrollYRef = useRef(virtualScrollY);
  const isVirtualScrollingRef = useRef(isVirtualScrolling);
  
  // Update refs when state changes
  useEffect(() => {
    scrollYRef.current = scrollY;
  }, [scrollY]);
  
  useEffect(() => {
    virtualScrollYRef.current = virtualScrollY;
  }, [virtualScrollY]);
  
  useEffect(() => {
    isVirtualScrollingRef.current = isVirtualScrolling;
  }, [isVirtualScrolling]);
  
  // High-performance scroll handling with minimal state updates
  useEffect(() => {
    // Animation configuration
    const THROTTLE_INTERVAL = 50; // ms between state updates
    const ANIMATION_THRESHOLD = 0.5; // minimum movement to continue animation
    const ANIMATION_SPEED = 0.15; // animation speed (higher = faster)
    const SCROLL_BOUNDARY = 10; // px from edge to activate virtual scrolling
    const WHEEL_DAMPEN = 0.15; // wheel event dampening factor
    
    // Animation state
    let isAnimating = false;
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    
    // Scroll tracking
    let realScrollY = window.scrollY;
    let targetVirtualY = realScrollY;
    let isVirtualMode = false;
    let virtualTopCounter = 0;
    let virtualBottomCounter = 0;
    
    // Optimized animation loop - only runs when needed
    const animate = () => {
      const now = performance.now();
      const currentVirtualY = isVirtualMode 
        ? virtualScrollYRef.current 
        : realScrollY;
      const distance = Math.abs(targetVirtualY - currentVirtualY);
      
      // Only update if significant movement or throttle interval passed
      if (distance > ANIMATION_THRESHOLD || (now - lastUpdateTime > THROTTLE_INTERVAL)) {
        if (now - lastUpdateTime > THROTTLE_INTERVAL) {
          // Simple linear interpolation for performance
          const newPos = currentVirtualY + (targetVirtualY - currentVirtualY) * ANIMATION_SPEED;
          
          // Batch state updates
          if (isVirtualMode) {
            setVirtualScrollY(newPos);
            setIsVirtualScrolling(true);
          } else {
            setScrollY(realScrollY);
            setVirtualScrollY(realScrollY);
            setIsVirtualScrolling(false);
          }
          
          lastUpdateTime = now;
        }
        
        // Continue animation
        rafId = requestAnimationFrame(animate);
      } else {
        // Stop animation when target reached
        isAnimating = false;
        
        // Final state update
        if (isVirtualMode) {
          setVirtualScrollY(targetVirtualY);
          setIsVirtualScrolling(true);
        } else {
          setScrollY(realScrollY);
          setVirtualScrollY(realScrollY);
          setIsVirtualScrolling(false);
        }
      }
    };
    
    // Start animation if needed
    const ensureAnimating = () => {
      if (!isAnimating) {
        isAnimating = true;
        rafId = requestAnimationFrame(animate);
      }
    };
    
    // Optimized scroll handler - uses native event
    const handleScroll = () => {
      realScrollY = window.scrollY;
      
      if (!isVirtualMode) {
        targetVirtualY = realScrollY;
        
        // Throttled state updates
        const now = performance.now();
        if (now - lastUpdateTime > THROTTLE_INTERVAL) {
          setScrollY(realScrollY);
          setVirtualScrollY(realScrollY);
          lastUpdateTime = now;
        }
      }
      
      ensureAnimating();
    };
    
    // Wheel handler - only processes at boundaries
    const handleWheel = (event: WheelEvent) => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const isAtBottom = realScrollY >= maxScroll - SCROLL_BOUNDARY;
      const isAtTop = realScrollY <= SCROLL_BOUNDARY;
      
      if (isAtBottom && event.deltaY > 0) {
        // Simple dampened delta
        const delta = event.deltaY * WHEEL_DAMPEN;
        virtualBottomCounter += delta;
        
        // Linear factor to slow movement
        const factor = 1 / (1 + virtualBottomCounter * 0.01);
        targetVirtualY = maxScroll + (virtualBottomCounter * factor);
        isVirtualMode = true;
        
        ensureAnimating();
      } 
      else if (isAtTop && event.deltaY < 0) {
        const delta = Math.abs(event.deltaY) * WHEEL_DAMPEN;
        virtualTopCounter += delta;
        
        const factor = 1 / (1 + virtualTopCounter * 0.01);
        targetVirtualY = -(virtualTopCounter * factor);
        isVirtualMode = true;
        
        ensureAnimating();
      }
      else {
        // Reset counters based on direction
        if (event.deltaY > 0) virtualTopCounter = 0;
        if (event.deltaY < 0) virtualBottomCounter = 0;
        
        if (!isAtBottom && !isAtTop) {
          isVirtualMode = false;
        }
      }
    };
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    // Initial animation if needed
    ensureAnimating();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []); // No dependencies for optimal performance
  
  // Typing effect
  useEffect(() => {
    setIsLoaded(true);
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 50);
    
    return () => clearInterval(typeInterval);
  }, []);
  
  // Data for feature cards
  const features = [
    { 
      icon: <FiGitBranch size={30} />, 
      title: "Knowledge Structure Preservation", 
      description: "Our embedding approach maintains the hierarchical relationships between concepts that are critical in specialized domains, ensuring AI systems understand how information is organized in your field."
    },
    { 
      icon: <FiGitCommit size={30} />, 
      title: "Context-Aware Embeddings", 
      description: "Unlike general-purpose embeddings, our system differentiates between terms that may seem similar but have distinct meanings in your domain, reducing confusion in AI responses."
    },
    { 
      icon: <FiGitMerge size={30} />, 
      title: "Integration with Existing Systems", 
      description: "Our embeddings work with your current AI infrastructure, enhancing performance without requiring rebuilding your entire knowledge base or model architecture."
    }
  ];

  // Data for industry cards
  const industries = [
    { 
      title: "Healthcare", 
      description: "Improve clinical decision support systems by correctly mapping relationships between symptoms, diagnoses, and treatment protocols in medical knowledge bases."
    },
    { 
      title: "Financial Services", 
      description: "Enhance regulatory compliance tools by better representing the complex interdependencies between financial regulations, policies, and reporting requirements."
    },
    { 
      title: "Engineering", 
      description: "Support design and specification systems by preserving critical dimensional relationships and engineering constraints in technical documentation."
    },
    { 
      title: "Legal", 
      description: "Improve contract analysis and case research by maintaining the proper context and precedent relationships essential for accurate legal interpretation."
    }
  ];
  
  // Helper for glass background effect
  const createGlassBackground = () => (
    <Box 
      position="absolute" 
      top="0" 
      left="0" 
      right="0" 
      bottom="0" 
      bg={glassBg}
      backdropFilter="blur(6px)"
      borderRadius="md"
      zIndex="-1"
    />
  );
  
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      flexDirection="column"
      bg={bgColor}
      color={textColor}
      position="relative"
    >
      {/* Starscape background with virtual scroll value */}
      <StarBackground scrollY={virtualScrollY} />
      
      {/* Debug indicator for virtual scrolling */}
      {isVirtualScrolling && (
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          p="10px"
          bg="rgba(0,0,0,0.8)"
          color="white"
          fontSize="xs"
          borderRadius="md"
          zIndex="tooltip"
          pointerEvents="none"
          transition="opacity 0.3s"
        >
          {virtualScrollY < scrollY 
            ? `↑ Virtual Scrolling Up: ${Math.abs(Math.round(virtualScrollY))} px` 
            : `↓ Virtual Scrolling Down: ${Math.round(virtualScrollY - scrollY)} px`}
        </Box>
      )}
      
      {/* Navigation */}
      <Box
        as="nav" 
        py={4} 
        borderBottom="1px solid" 
        borderBottomColor={borderColor}
        position="sticky"
        top="0"
        zIndex="sticky"
      >
        {createGlassBackground()}
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            {/* Logo */}
            <Image 
              src={logoImage} 
              alt="SeedSpace Logo" 
              height="50px" 
              width="auto"
            />
            
            <Button
              as="a"
              variant="ghost"
              color={textColor}
              rightIcon={<FiArrowRight />}
              href="#contact"
              borderRadius="2px"
              _hover={{
                bg: 'transparent',
                borderBottom: `2px solid ${textColor}`,
                transform: 'translateY(-2px)'
              }}
              _active={{
                bg: 'transparent'
              }}
            >
              Request Early Access
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Main content */}
      <Box flex="1">
        {/* Hero Section */}
        <Box 
          as="section" 
          py={20}
          position="relative"
          overflow="hidden"
        >          
          <Container maxW="1480px" position="relative" zIndex="2">
            <Flex
              direction={{ base: 'column', lg: 'row' }}
              gap={{ base: 16, lg: 10 }}
              align="center"
              justify="space-between"
            >
              <VStack 
                spacing={8} 
                align="flex-start" 
                maxW={{ base: '100%', lg: '50%' }}
                opacity={isLoaded ? 1 : 0}
                animation={shouldAnimate ? `${fadeIn} 1s ease-out forwards` : 'none'}
                position="relative"
                p={6}
                pl={{ base: 8, md: 12, lg: 16 }}
                borderRadius="md"
                zIndex={2}
              >
                <Box position="relative">
                  {createGlassBackground()}
                  <Heading
                    as="h1"
                    fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                    letterSpacing="wider"
                    lineHeight="1.1"
                    color={textColor}
                  >
                    Specialized <chakra.span color={textColor}>Knowledge</chakra.span> for AI Systems
                  </Heading>
                  
                  <Text 
                    fontSize={{ base: 'lg', md: 'xl' }} 
                    letterSpacing="tight"
                    color={mutedTextColor}
                    className="caret-text"
                    maxW="95%"
                  >
                    {typedText}
                  </Text>
                  
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    color={mutedTextColor}
                    lineHeight="tall"
                    maxW="95%"
                  >
                    Seedspace helps AI systems properly understand domain-specific knowledge. We create tailored embedding approaches that better preserve the specialized relationships between concepts in fields like healthcare, finance, and engineering.
                  </Text>
                  
                  <Text
                    fontSize={{ base: 'md', md: 'lg' }}
                    color={mutedTextColor}
                    lineHeight="tall"
                    maxW="95%"
                  >
                    Seedspace transforms complex domain expertise into precise embeddings—enabling AI to understand and utilize specialized knowledge with unmatched accuracy.
                  </Text>
                  
                  <HStack spacing={6} pt={4} align="center">
                    <Button
                      size="lg"
                      color={bgColor}
                      bg={textColor}
                      borderRadius="2px"
                      px={8}
                      fontSize="md"
                      fontWeight="500"
                      letterSpacing="wider"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg'
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      as="a"
                      href="#contact"
                      position="relative"
                      zIndex={3}
                    >
                      REQUEST ACCESS
                    </Button>
                    
                    <HStack spacing={3}>
                      <Text color={mutedTextColor} fontWeight="500" fontSize="sm">
                        v1.0.2
                      </Text>
                      <Box h="10px" w="1px" bg={borderColor} opacity="0.5" />
                      <Text color={mutedTextColor} fontWeight="400" fontSize="sm">
                        Early Access
                      </Text>
                    </HStack>
                  </HStack>
                </Box>
              </VStack>
              
              <Box 
                position="relative"
                height={{ base: '600px', md: '750px', lg: '650px' }}
                width={{ base: '100%', lg: '60%' }}
                opacity={isLoaded ? 1 : 0}
                animation={shouldAnimate ? `${fadeIn} 1.5s ease-out 0.3s forwards` : 'none'}
                display="flex"
                justifyContent="center"
                overflow="visible"
                zIndex={1}
                mt={{ base: 0, lg: "-50px" }}
                mb={{ base: 0, lg: "100px" }}
                alignSelf="flex-start"
              >
                <ConstellationHero 
                  height="100%"
                  width="100%"
                />
              </Box>
            </Flex>
          </Container>
        </Box>

        {/* Capabilities Section */}
        <Box
          as="section"
          py={24}
          position="relative"
          zIndex="2"
        >
          <Container maxW="container.xl">
            <VStack spacing={16} align="stretch">
              <SectionHeading 
                isLoaded={isLoaded} 
                shouldAnimate={shouldAnimate}
                highlight="Core"
              >
                Capabilities
              </SectionHeading>
              
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={12}
                justify="space-between"
                opacity={isLoaded ? 1 : 0}
                animation={shouldAnimate ? `${fadeIn} 1s ease-out 0.9s forwards` : 'none'}
              >
                {features.map((feature, i) => (
                  <FeatureCard
                    key={i}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    borderColor={borderColor}
                    textColor={textColor}
                    mutedTextColor={mutedTextColor}
                  />
                ))}
              </Flex>
            </VStack>
          </Container>
        </Box>

        {/* Use Cases Section */}
        <Box
          as="section"
          py={24}
          position="relative"
          zIndex="2"
        >
          <Container maxW="container.xl">
            <VStack spacing={16} align="stretch">
              <SectionHeading 
                isLoaded={isLoaded} 
                shouldAnimate={shouldAnimate}
                highlight="Industry"
              >
                Applications
              </SectionHeading>
              
              <Flex 
                direction={{ base: 'column', md: 'row' }} 
                gap={8}
                justify="space-between"
                wrap="wrap"
                opacity={isLoaded ? 1 : 0}
                animation={shouldAnimate ? `${fadeIn} 1s ease-out 0.9s forwards` : 'none'}
              >
                {industries.map((industry, i) => (
                  <IndustryCard
                    key={i}
                    title={industry.title}
                    description={industry.description}
                    borderColor={borderColor}
                    mutedTextColor={mutedTextColor}
                  />
                ))}
              </Flex>
              
              <Flex 
                justify="center" 
                pt={8}
              >
                <Button
                  as="a"
                  href="/blog/introducing-seedspace"
                  size="md"
                  variant="outline"
                  color={textColor}
                  borderColor={borderColor}
                  rightIcon={<FiArrowRight />}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'sm'
                  }}
                >
                  Read our technical overview
                </Button>
              </Flex>
            </VStack>
          </Container>
        </Box>

        {/* Contact Section */}
        <Box
          as="section"
          py={24}
          id="contact"
          borderTop="1px solid"
          borderColor={borderColor}
          position="relative"
          zIndex="2"
        >
          <Container maxW="container.xl">
            <Flex 
              direction={{ base: 'column', lg: 'row' }} 
              gap={16}
              align="center"
              justify="space-between"
            >
              <VStack 
                spacing={8} 
                align="flex-start"
                maxW={{ base: '100%', lg: '45%' }}
                opacity={isLoaded ? 1 : 0}
                animation={shouldAnimate ? `${fadeIn} 1s ease-out 1.2s forwards` : 'none'}
                position="relative"
                p={6}
                borderRadius="md"
              >
                <Box position="relative">
                  {createGlassBackground()}
                  <Heading fontSize={{ base: '3xl', lg: '4xl' }}>
                    Work <chakra.span color={textColor}>With Us</chakra.span>
                  </Heading>
                  
                  <Text fontSize="lg" color={mutedTextColor} lineHeight="tall">
                    We're looking for organizations with challenging domain-specific AI problems. Our team can help you evaluate where specialized knowledge representation could improve your AI systems' accuracy and reliability.
                  </Text>
                  
                  <Text fontSize="md" color={mutedTextColor} lineHeight="tall" pt={2}>
                    <chakra.span fontWeight="500">Early access program</chakra.span> is now open for partners in healthcare, financial services, engineering, and legal sectors who want to improve their AI applications.
                  </Text>
                  
                  <Divider borderColor={borderColor} opacity="0.6" />
                  
                  <Button
                    size="lg"
                    color={bgColor}
                    bg={textColor}
                    borderRadius="2px"
                    px={8}
                    fontWeight="500"
                    letterSpacing="wider"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                    as="a"
                    href="mailto:contact@seedspace.ai"
                    rightIcon={<FiArrowRight />}
                  >
                    CONTACT
                  </Button>
                </Box>
              </VStack>
              
              <Box
                height="300px"
                width={{ base: '100%', lg: '45%' }}
                opacity={isLoaded ? 1 : 0}
                animation={shouldAnimate ? `${fadeIn} 1s ease-out 1.5s forwards` : 'none'}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                p={4}
                borderRadius="md"
                position="relative"
              >
                {createGlassBackground()}
                {/* Simple minimalist contact information display */}
                <VStack 
                  spacing={8} 
                  align="stretch"
                  height="100%"
                  justify="space-between"
                  pt={2}
                >
                  <VStack spacing={6} align="flex-start">
                    <Box borderTop="1px solid" borderColor={borderColor} pt={4} w="100%">
                      <Text fontWeight="500" fontSize="md" mb={1}>Email</Text>
                      <Text 
                        color={mutedTextColor} 
                        as="a" 
                        href="mailto:contact@seedspace.ai"
                        _hover={{ color: textColor }}
                      >
                        contact@seedspace.ai
                      </Text>
                    </Box>
                    
                    <Box borderTop="1px solid" borderColor={borderColor} pt={4} w="100%">
                      <Text fontWeight="500" fontSize="md" mb={1}>Response Time</Text>
                      <Text color={mutedTextColor}>Within 24 hours</Text>
                    </Box>
                    
                    <Box borderTop="1px solid" borderColor={borderColor} pt={4} w="100%">
                      <Text fontWeight="500" fontSize="md" mb={1}>Location</Text>
                      <Text color={mutedTextColor}>Global Remote-First Team</Text>
                    </Box>
                  </VStack>
                  
                  <Box 
                    alignSelf="flex-start" 
                    borderTop="1px solid"
                    borderColor={borderColor}
                    pt={4}
                    w="100%"
                  >
                    <Text fontSize="xs" color={mutedTextColor} opacity="0.7">
                      We're available for collaboration opportunities
                      and technical discussions.
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </Flex>
          </Container>
        </Box>
      </Box>

      {/* Footer */}
      <Box 
        as="footer" 
        py={10}
        borderTop="1px solid" 
        borderColor={borderColor}
        position="relative"
        zIndex="2"
      >
        {createGlassBackground()}
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column-reverse', md: 'row' }}
            justify="space-between"
            align={{ base: 'center', md: 'flex-start' }}
            gap={4}
          >
            <VStack spacing={4} align={{ base: 'center', md: 'flex-start' }}>
              <Text color={mutedTextColor} fontSize="sm">
                &copy; {new Date().getFullYear()} Seedspace AI. All rights reserved.
              </Text>
              
              <HStack spacing={4} align="center">
                <Text color={mutedTextColor} fontSize="xs" opacity="0.8">
                  Made with precision in San Francisco
                </Text>
                <Box h="10px" w="1px" bg={borderColor} />
                <Text color={mutedTextColor} fontSize="xs" opacity="0.8">
                  contact@seedspace.ai
                </Text>
              </HStack>
            </VStack>
            
            <VStack spacing={3} mb={{ base: 6, md: 0 }} align={{ base: 'center', md: 'flex-end' }}>
              <HStack spacing={8}>
                <Text as="a" href="#" color={mutedTextColor} fontSize="sm">Privacy</Text>
                <Text as="a" href="#" color={mutedTextColor} fontSize="sm">Terms</Text>
                <Text as="a" href="/blog" color={mutedTextColor} fontSize="sm">Blog</Text>
              </HStack>
              
              <Text color={mutedTextColor} fontSize="xs" opacity="0.7" textAlign={{ base: 'center', md: 'right' }}>
                Trusted by AI research teams at leading enterprises
              </Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

export default App
