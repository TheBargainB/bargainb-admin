'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from '@/components/ui/button'

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Ensure component is mounted before rendering to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant='outline' size='sm' disabled>
                <Sun className='h-4 w-4' />
            </Button>
        )
    }

    const toggleTheme = () => {
        // Use resolvedTheme to get the actual applied theme (resolves "system" to "light" or "dark")
        const currentTheme = resolvedTheme
        setTheme(currentTheme === 'dark' ? 'light' : 'dark')
    }

    // Use resolvedTheme for display logic too
    const currentTheme = resolvedTheme

    return (
        <div
            onClick={toggleTheme}
            className='flex items-center w-20 h-10 bg-[#F4FBF4] dark:bg-[#9A89FF] dark:bg-opacity-30 rounded-full p-1 cursor-pointer relative shadow-[-7.1px_-7.1px_14.2px_0px_rgba(233,_234,_240,_0.70)] dark:shadow-[0px_3.22px_3.22px_0px_rgba(0,_0,_0,_0.25),_8.05px_8.05px_16.1px_0px_#24272C] pointer-events-auto z-[60]'
            title={`Switch to ${
                currentTheme === 'dark' ? 'light' : 'dark'
            } mode`}
        >
            <div
                className={`absolute transition-all duration-300 ${
                    currentTheme === 'dark' ? 'translate-x-11' : 'translate-x-0'
                } bg-[#123013] dark:bg-[#EBEBEB] w-7 h-7 rounded-full flex items-center justify-center shadow-md pointer-events-auto`}
            >
                {currentTheme === 'dark' ? (
                    <>
                        <Sun className='h-4 w-4 text-[#37953B]' />
                    </>
                ) : (
                    <>
                        <Moon className='h-4 w-4 text-white' />
                    </>
                )}
            </div>
        </div>
    )
}
