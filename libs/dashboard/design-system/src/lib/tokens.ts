export const TOKENS = {
    TYPOGRAPHY: {
        fontFamily: '"Inter", sans-serif',
        scale: {
            display: { fontSize: '3rem', lineHeight: '3.5rem', fontWeight: '700' },
            h1: { fontSize: '2.25rem', lineHeight: '2.75rem', fontWeight: '700' },
            h2: { fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: '600' },
            h3: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '600' },
            h4: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },
            bodyLg: { fontSize: '1.125rem', lineHeight: '1.75rem', fontWeight: '400' },
            body: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: '400' },
            bodySm: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '400' },
            caption: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: '500' },
        },
    },
    SPACING: {
        base: 4,
        scale: {
            xs: '0.25rem', // 4px
            sm: '0.5rem',  // 8px
            md: '1rem',    // 16px
            lg: '1.5rem',  // 24px
            xl: '2rem',    // 32px
            '2xl': '3rem', // 48px
            '3xl': '4rem', // 64px
        },
    },
    RADIUS: {
        card: '1.25rem',
        modal: '1.5rem',
        pill: '9999px',
    },
    COLORS: {
        surface: '#ffffff',
        surfaceGlass: 'rgba(255, 255, 255, 0.7)',
        textPrimary: '#111827', // gray-900
        textSecondary: '#4b5563', // gray-600
        borderSubtle: 'rgba(229, 231, 235, 1)', // gray-200
    }
};
