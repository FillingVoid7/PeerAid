'use client'; 

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/themeProvider';

export function Providers({ children, session }: { children: React.ReactNode; session: any }) {
    return(
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </SessionProvider>
    );
}

