import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/useAuth'
import type { Metadata } from 'next'
import { Inter, Noto_Sans, Paytone_One } from 'next/font/google'
import type React from 'react'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

const paytoneOne = Paytone_One({
    variable: '--font-paytone-one',
    subsets: ['latin'],
    display: 'swap',
    weight: '400',
})

const notoSans = Noto_Sans({
    variable: '--font-noto-sans',
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'BargainB - Price Comparison Platform',
    description:
        'Compare prices from top retailers and save money on your purchases',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body
                className={`${notoSans.variable} ${paytoneOne.variable} ${inter.variable}`}
            >
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        {children}
                        <Toaster />
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
