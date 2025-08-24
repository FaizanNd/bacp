/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-in': 'slideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-in': 'bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shake': 'shake 0.8s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'rotate-in': 'rotateIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'flip-in': 'flipIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'zoom-in': 'zoomIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic-in': 'elasticIn 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'heartbeat': 'heartbeat 1s ease-in-out infinite',
        'rainbow-border': 'rainbowBorder 3s linear infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'typing': 'typing 2s steps(40, end), blink 0.75s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-50px) rotateY(-10deg)' },
          '100%': { opacity: '1', transform: 'translateX(0) rotateY(0deg)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotate(-5deg)' },
          '50%': { transform: 'scale(1.05) rotate(2deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(-100px)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1) translateY(10px)' },
          '70%': { transform: 'scale(0.95) translateY(-5px)' },
          '85%': { transform: 'scale(1.02) translateY(2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px) rotate(-1deg)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px) rotate(1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-100px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        rotateIn: {
          '0%': { opacity: '0', transform: 'rotate(-180deg) scale(0.5)' },
          '100%': { opacity: '1', transform: 'rotate(0deg) scale(1)' },
        },
        flipIn: {
          '0%': { opacity: '0', transform: 'rotateY(-90deg) scale(0.8)' },
          '100%': { opacity: '1', transform: 'rotateY(0deg) scale(1)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(10deg)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1) rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        elasticIn: {
          '0%': { opacity: '0', transform: 'scale(0.1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
          '75%': { transform: 'scale(0.9)' },
          '90%': { transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg) scale(1.05)' },
          '75%': { transform: 'rotate(3deg) scale(1.05)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        rainbowBorder: {
          '0%': { borderColor: '#ff0000' },
          '16.66%': { borderColor: '#ff8000' },
          '33.33%': { borderColor: '#ffff00' },
          '50%': { borderColor: '#00ff00' },
          '66.66%': { borderColor: '#0080ff' },
          '83.33%': { borderColor: '#8000ff' },
          '100%': { borderColor: '#ff0000' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(147, 51, 234, 0.5)',
        'glow-lg': '0 0 40px rgba(147, 51, 234, 0.8)',
      },
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
      },
    },
  },
  plugins: [],
};