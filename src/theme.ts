// High-tech theme with organic inspiration for Chakra UI
const theme = {
  fonts: {
    heading: "'Share Tech', monospace",
    body: "'Space Grotesk', sans-serif",
  },
  colors: {
    brand: {
      50: '#FFFBF2', // Light brand color
      100: '#FFF9E8',
      200: '#FFF5D9',
      300: '#FFF0C7',
      400: '#FFEBB5',
      500: '#FFE6A3',
      600: '#FFD980',
      700: '#FFC95C',
      800: '#FFB939',
      900: '#FFA916',
    },
    secondary: {
      50: '#E0E0E6',
      100: '#C2C2CC',
      200: '#A4A4B3',
      300: '#868699',
      400: '#696980',
      500: '#4B4B66',
      600: '#3C3C52',
      700: '#2E2E3D',
      800: '#1F1F29',
      900: '#000011', // Dark brand color
    },
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#000011' : '#FFFBF2',
        color: props.colorMode === 'dark' ? '#FFFBF2' : '#000011',
      }
    })
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '2px',
        fontWeight: '500',
        letterSpacing: '0.02em',
      },
    },
    Heading: {
      baseStyle: {
        letterSpacing: '0.03em',
      },
    },
    Card: {
      baseStyle: {
        borderRadius: '3px',
      },
    },
    Container: {
      baseStyle: {
        maxW: '1200px',
      },
    },
  },
  radii: {
    sm: '2px',
    md: '3px',
    lg: '4px',
    xl: '6px',
  },
}

export default theme 