'use client'

import { getTranslation, type LanguageCode } from '@/lib/translations'
import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('nl')

    const t = getTranslation(currentLanguage)
  return (
    <footer className="relative z-10 w-full py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="font-[family-name:var(--font-inter)] flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-[#484848] dark:text-[#F5F5F5]">
            <span>
              {currentLanguage === 'nl' ? '© 2024 BargainB - Alle rechten voorbehouden' : 
               currentLanguage === 'en' ? '© 2024 BargainB - All rights reserved' :
               currentLanguage === 'de' ? '© 2024 BargainB - Alle Rechte vorbehalten' :
               currentLanguage === 'fr' ? '© 2024 BargainB - Tous droits réservés' :
               currentLanguage === 'it' ? '© 2024 BargainB - Tutti i diritti riservati' :
               '© 2024 BargainB - Todos los derechos reservados'}
            </span>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className='h-2 w-2 rounded-full bg-[#AFEDB1]' />
                  <Link href="/privacy-policy" target='_blank' className="font-[family-name:var(--font-inter)] hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline">
                  {currentLanguage === 'nl' ? 'Privacybeleid' : 
                  currentLanguage === 'en' ? 'Privacy Policy' :
                  currentLanguage === 'de' ? 'Datenschutzerklärung' :
                  currentLanguage === 'fr' ? 'Politique de confidentialité' :
                  currentLanguage === 'it' ? 'Informativa sulla privacy' :
                  'Política de Privacidad'}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <div className='h-2 w-2 rounded-full bg-[#AFEDB1]' />
                <Link href="/terms-conditions" target='_blank' className="font-[family-name:var(--font-inter)] hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline">
                  {currentLanguage === 'nl' ? 'Algemene voorwaarden' : 
                  currentLanguage === 'en' ? 'Terms of Service' :
                  currentLanguage === 'de' ? 'Allgemeine Geschäftsbedingungen' :
                  currentLanguage === 'fr' ? 'Conditions générales' :
                  currentLanguage === 'it' ? 'Termini di servizio' :
                  'Términos de Servicio'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}
