export type LanguageCode = 'nl' | 'en' | 'de' | 'fr' | 'it' | 'es'

export interface Translations {
  hero: {
    waitingBadge: string
    peopleWaiting: string
    earlyAccess: string
    bargainB: string
    description: string
    firstAccess: string
    exclusiveWhatsApp: string
  }
  form: {
    phoneLabel: string
    phonePlaceholder: string
    submitButton: string
    submitting: string
    successMessage: string
    successDescription: string
  }
  socialProof: {
    joinText: string
    earlyAdopters: string
  }
  faq: {
    title: string
    questions: {
      whatIs: {
        question: string
        answer: string
      }
      whenAccess: {
        question: string
        answer: string
      }
      benefits: {
        question: string
        answer: string
      }
      free: {
        question: string
        answer: string
      }
    }
  }
  finalCta: {
    question: string
    action: string
  }
  validation: {
    phoneLength: string
    phoneFormat: string
    phoneNumbers: string
  }
  toast: {
    success: {
      title: string
      description: string
    }
    exists: {
      title: string
      description: string
    }
    error: {
      title: string
      description: string
    }
  }
  onboarding: {
    common: {
      back: string
      continue: string
      required: string
      optional: string
    }
    step3: {
      title: string
      description: string
      country: string
      city: string
      countryPlaceholder: string
      cityPlaceholder: string
      countryHelper: string
      cityHelper: string
      countryRequired: string
      cityRequired: string
    }
    step4: {
      title: string
      description: string
      selectedStores: string
      helpText: string
    }
    step5: {
      title: string
      description: string
      dietaryPreferences: string
      foodAllergies: string
      yourSelections: string
      helpText: string
      dietaryOptions: {
        vegetarian: string
        vegan: string
        glutenFree: string
        dairyFree: string
        keto: string
        paleo: string
        lowSodium: string
        diabetic: string
        halal: string
        kosher: string
      }
      allergyOptions: {
        nuts: string
        peanuts: string
        dairy: string
        eggs: string
        soy: string
        gluten: string
        shellfish: string
        fish: string
        sesame: string
        sulfites: string
      }
    }
    step6: {
      title: string
      description: string
      quickStartLists: string
      smartAnalysis: string
      fridgeDescription: string
      pantryDescription: string
      shoppingListDescription: string
      upload: string
      camera: string
      analyzing: string
      aiSuggestions: string
      yourShoppingList: string
      helpText: string
    }
    step7: {
      title: string
      description: string
      availablePlatforms: string
      popular: string
      comingSoon: string
      selected: string
      selectedIntegrations: string
      whatsappBenefits: string
      benefit1: string
      benefit2: string
      benefit3: string
      benefit4: string
      skipForNow: string
      helpText: string
    }
    completion: {
      welcomeTitle: string
      welcomeDescWhatsApp: string
      welcomeDescDefault: string
      profileSummaryTitle: string
      location: string
      groceryStores: string
      dietaryPreferences: string
      foodAllergies: string
      initialGroceryList: string
      aiIntegrations: string
      items: string
      whatsappIntegrationActive: string
      whatsappIntegrationDesc: string
      whatsappIntegrationDescContinued: string
      completeSetup: string
      setupCompleteTitle: string
      checkWhatsappDesc: string
      profileCreatedTitle: string
      enableIntegrationsDesc: string
    }
  }
}

export const translations: Record<LanguageCode, Translations> = {
  nl: {
    hero: {
      waitingBadge: "mensen wachten al",
      peopleWaiting: "mensen wachten al",
      earlyAccess: "Early Access",
      bargainB: "BargainB",
      description: "Krijg als eerste toegang tot de slimste manier om geld te besparen op je boodschappen.",
      firstAccess: "eerste toegang",
      exclusiveWhatsApp: "Exclusief via WhatsApp."
    },
    form: {
      phoneLabel: "Je Nederlandse mobiele nummer",
      phonePlaceholder: "6 12345678",
      submitButton: "Krijg Early Access 🚀",
      submitting: "Even geduld...",
      successMessage: "✅ Perfect! We sturen een WhatsApp naar",
      successDescription: "Je staat nu op de early access lijst!"
    },
    socialProof: {
      joinText: "Join",
      earlyAdopters: "early adopters"
    },
    faq: {
      title: "Veelgestelde vragen",
      questions: {
        whatIs: {
          question: "Wat is BargainB Early Access?",
          answer: "Krijg als eerste toegang tot BargainB en ontdek de beste supermarktaanbiedingen via WhatsApp. Vroege gebruikers krijgen exclusieve voordelen en kortingen."
        },
        whenAccess: {
          question: "Wanneer krijg ik toegang?",
          answer: "Early Access gebruikers krijgen binnen 2-3 weken toegang tot de BargainB beta. Je ontvangt een WhatsApp bericht zodra je account klaar is."
        },
        benefits: {
          question: "Wat zijn de voordelen van Early Access?",
          answer: "Exclusieve kortingen, premium functies, prioriteit ondersteuning, en de kans om mee te bouwen aan de toekomst van slimme boodschappen doen."
        },
        free: {
          question: "Is Early Access gratis?",
          answer: "Ja! Early Access is volledig gratis. Vroege gebruikers krijgen zelfs extra voordelen en kortingen die later niet meer beschikbaar zijn."
        }
      }
    },
    finalCta: {
      question: "Klaar om te starten met slimmer boodschappen doen?",
      action: "Vul je nummer hierboven in"
    },
    validation: {
      phoneLength: "Mobiel nummer moet precies 9 cijfers zijn (6 + 8 cijfers)",
      phoneFormat: "Mobiel nummer moet beginnen met 6",
      phoneNumbers: "Mobiel nummer mag alleen cijfers bevatten"
    },
    toast: {
      success: {
        title: "Gefeliciteerd! 🎉",
        description: "Je staat nu op de early access lijst!"
      },
      exists: {
        title: "Je staat al op de lijst! 📱",
        description: "We sturen je binnenkort een WhatsApp bericht."
      },
      error: {
        title: "Oeps! 😅",
        description: "Probeer het opnieuw."
      }
    },
    onboarding: {
      common: {
        back: "Terug",
        continue: "Doorgaan",
        required: "Verplicht",
        optional: "Optioneel"
      },
      step3: {
        title: "Je Locatie",
        description: "Help ons je ervaring te personaliseren door je locatie te delen.",
        country: "Land",
        city: "Stad",
        countryPlaceholder: "Selecteer je land",
        cityPlaceholder: "bijv. Amsterdam, Brussel, Berlijn",
        countryHelper: "Selecteer het land waar je boodschappen doet.",
        cityHelper: "Voer de stad in waar je boodschappen doet.",
        countryRequired: "Land is verplicht",
        cityRequired: "Stad is verplicht"
      },
      step4: {
        title: "Kies Je Supermarkten",
        description: "Selecteer de supermarkten waar je graag winkelt. Je kunt meerdere winkels kiezen.",
        selectedStores: "Geselecteerde Winkels",
        helpText: "Maak je geen zorgen, je kunt je voorkeuren later altijd wijzigen in de instellingen."
      },
      step5: {
        title: "Dieetvoorkeuren & Allergieën",
        description: "Help ons je winkelervaring te personaliseren door je dieetbehoeften en allergieën te delen.",
        dietaryPreferences: "Dieetvoorkeuren",
        foodAllergies: "Voedselallergieën",
        yourSelections: "Je Selecties",
        helpText: "Deze informatie helpt ons geschikte producten voor te stellen en items te filteren die niet bij je behoeften passen.",
        dietaryOptions: {
          vegetarian: "Vegetarisch",
          vegan: "Veganistisch",
          glutenFree: "Glutenvrij",
          dairyFree: "Dairy-vrij",
          keto: "Keto",
          paleo: "Paleo",
          lowSodium: "Laag in zout",
          diabetic: "Diabetisch",
          halal: "Halal",
          kosher: "Kosher"
        },
                  allergyOptions: {
            nuts: "Boomnoten",
            peanuts: "Pinda's",
            dairy: "Melkproducten",
            eggs: "Eieren",
            soy: "Soja",
            gluten: "Gluten",
            shellfish: "Schelpdieren",
            fish: "Vis",
            sesame: "Sesam",
            sulfites: "Sulfiten"
          }
      },
      step6: {
        title: "Maak Je Boodschappenlijst",
        description: "Kies uit kant-en-klare lijsten of upload foto's van je koelkast/voorraadkast voor gepersonaliseerde suggesties.",
        quickStartLists: "Snelstart Lijsten",
        smartAnalysis: "Slimme Analyse",
        fridgeDescription: "Zie wat je tekort komt",
        pantryDescription: "Controleer je voorraadkast",
        shoppingListDescription: "Upload je geschreven lijst",
        upload: "Uploaden",
        camera: "Camera",
        analyzing: "Je afbeelding analyseren...",
        aiSuggestions: "AI Suggesties",
        yourShoppingList: "Je Boodschappenlijst",
        helpText: "AI zal je foto's analyseren om items voor te stellen die je mogelijk nodig hebt. Je kunt altijd items toevoegen of verwijderen."
      },
      step7: {
        title: "Kies Je AI Integratie",
        description: "Selecteer waar je je AI boodschappen-assistent wilt gebruiken. Je kunt later altijd meer toevoegen.",
        availablePlatforms: "Beschikbare Platforms",
        popular: "Populair",
        comingSoon: "Binnenkort Beschikbaar",
        selected: "Geselecteerd",
        selectedIntegrations: "Geselecteerde Integraties",
        whatsappBenefits: "📱 WhatsApp Integratie Voordelen:",
        benefit1: "• Krijg instant boodschappensuggesties",
        benefit2: "• Deel foto's voor slimme boodschappenlijsten",
        benefit3: "• Ontvang gepersonaliseerde maaltijdaanbevelingen",
        benefit4: "• Volg je winkelvoortgang",
        skipForNow: "Voorlopig Overslaan",
        helpText: "Maak je geen zorgen! Je kunt later altijd meer integraties inschakelen vanuit je dashboard-instellingen."
      },
      completion: {
        welcomeTitle: "Welkom bij BargainB!",
        welcomeDescWhatsApp: "Je profiel is klaar! Je ontvangt binnenkort een WhatsApp-bericht om je AI boodschappenassistent te gaan gebruiken.",
        welcomeDescDefault: "Je profiel is klaar! Je kunt BargainB altijd gebruiken door integraties in te schakelen in je instellingen.",
        profileSummaryTitle: "Je profieloverzicht",
        location: "Locatie",
        groceryStores: "Supermarkten",
        dietaryPreferences: "Dieetvoorkeuren",
        foodAllergies: "Voedselallergieën",
        initialGroceryList: "Initiële boodschappenlijst",
        aiIntegrations: "AI-integraties",
        items: "items",
        whatsappIntegrationActive: "WhatsApp-integratie actief",
        whatsappIntegrationDesc: "Zoek naar een bericht van BargainB op WhatsApp op",
        whatsappIntegrationDescContinued: "Je AI-assistent helpt je met boodschappen doen, maaltijden plannen en meer!",
        completeSetup: "Setup voltooien",
        setupCompleteTitle: "Setup voltooid!",
        checkWhatsappDesc: "Controleer je WhatsApp voor een bericht van BargainB!",
        profileCreatedTitle: "Profiel aangemaakt!",
        enableIntegrationsDesc: "Je kunt integraties altijd inschakelen vanuit de instellingen."
      }
    }
  },
  en: {
    hero: {
      waitingBadge: "people waiting",
      peopleWaiting: "people waiting",
      earlyAccess: "Early Access",
      bargainB: "BargainB",
      description: "Get first access to the smartest way to save money on your groceries.",
      firstAccess: "first access",
      exclusiveWhatsApp: "Exclusively via WhatsApp."
    },
    form: {
      phoneLabel: "Your Dutch mobile number",
      phonePlaceholder: "6 12345678",
      submitButton: "Get Early Access 🚀",
      submitting: "Please wait...",
      successMessage: "✅ Perfect! We'll send a WhatsApp to",
      successDescription: "You're now on the early access list!"
    },
    socialProof: {
      joinText: "Join",
      earlyAdopters: "early adopters"
    },
    faq: {
      title: "Frequently Asked Questions",
      questions: {
        whatIs: {
          question: "What is BargainB Early Access?",
          answer: "Get first access to BargainB and discover the best supermarket deals via WhatsApp. Early users get exclusive benefits and discounts."
        },
        whenAccess: {
          question: "When will I get access?",
          answer: "Early Access users get access to BargainB beta within 2-3 weeks. You'll receive a WhatsApp message as soon as your account is ready."
        },
        benefits: {
          question: "What are the Early Access benefits?",
          answer: "Exclusive discounts, premium features, priority support, and the chance to help build the future of smart grocery shopping."
        },
        free: {
          question: "Is Early Access free?",
          answer: "Yes! Early Access is completely free. Early users even get extra benefits and discounts that won't be available later."
        }
      }
    },
    finalCta: {
      question: "Ready to start smart grocery shopping?",
      action: "Enter your number above"
    },
    validation: {
      phoneLength: "Mobile number must be exactly 9 digits (6 + 8 digits)",
      phoneFormat: "Mobile number must start with 6",
      phoneNumbers: "Mobile number can only contain digits"
    },
    toast: {
      success: {
        title: "Congratulations! 🎉",
        description: "You're now on the early access list!"
      },
      exists: {
        title: "You're already on the list! 📱",
        description: "We'll send you a WhatsApp message soon."
      },
      error: {
        title: "Oops! 😅",
        description: "Please try again."
      }
    },
    onboarding: {
      common: {
        back: "Back",
        continue: "Continue",
        required: "Required",
        optional: "Optional"
      },
      step3: {
        title: "Your Location",
        description: "Help us personalize your experience by sharing your location.",
        country: "Country",
        city: "City",
        countryPlaceholder: "Select your country",
        cityPlaceholder: "e.g. Amsterdam, Brussels, Berlin",
        countryHelper: "Select the country where you'll be shopping.",
        cityHelper: "Enter the city where you'll be shopping for groceries.",
        countryRequired: "Country is required",
        cityRequired: "City is required"
      },
      step4: {
        title: "Choose Your Grocery Stores",
        description: "Select the grocery stores where you like to shop. You can choose multiple stores.",
        selectedStores: "Selected Stores",
        helpText: "Don't worry, you can always change your preferences later in settings."
      },
      step5: {
        title: "Dietary Preferences & Allergies",
        description: "Help us personalize your shopping experience by sharing your dietary needs and any allergies.",
        dietaryPreferences: "Dietary Preferences",
        foodAllergies: "Food Allergies",
        yourSelections: "Your Selections",
        helpText: "This information helps us suggest suitable products and filter out items that don't match your needs.",
        dietaryOptions: {
          vegetarian: "Vegetarian",
          vegan: "Vegan",
          glutenFree: "Gluten-free",
          dairyFree: "Dairy-free",
          keto: "Keto",
          paleo: "Paleo",
          lowSodium: "Low Sodium",
          diabetic: "Diabetic",
          halal: "Halal",
          kosher: "Kosher"
        },
        allergyOptions: {
          nuts: "Nuts",
          peanuts: "Peanuts",
          dairy: "Dairy",
          eggs: "Eggs",
          soy: "Soy",
          gluten: "Gluten",
          shellfish: "Shellfish",
          fish: "Fish",
          sesame: "Sesame",
          sulfites: "Sulfites"
        }
      },
      step6: {
        title: "Build Your Grocery List",
        description: "Choose from pre-made lists or upload photos of your fridge/pantry to get personalized suggestions.",
        quickStartLists: "Quick Start Lists",
        smartAnalysis: "Smart Analysis",
        fridgeDescription: "See what you're running low on",
        pantryDescription: "Check your pantry staples",
        shoppingListDescription: "Upload your written list",
        upload: "Upload",
        camera: "Camera",
        analyzing: "Analyzing your image...",
        aiSuggestions: "AI Suggestions",
        yourShoppingList: "Your Shopping List",
        helpText: "AI will analyze your photos to suggest items you might need. You can always add or remove items."
      },
      step7: {
        title: "Choose Your AI Integration",
        description: "Select where you'd like to use your AI grocery assistant. You can always add more later.",
        availablePlatforms: "Available Platforms",
        popular: "Popular",
        comingSoon: "Coming Soon",
        selected: "Selected",
        selectedIntegrations: "Selected Integrations",
        whatsappBenefits: "📱 WhatsApp Integration Benefits:",
        benefit1: "• Get instant grocery suggestions",
        benefit2: "• Share photos for smart shopping lists",
        benefit3: "• Receive personalized meal recommendations",
        benefit4: "• Track your shopping progress",
        skipForNow: "Skip for Now",
        helpText: "Don't worry! You can always enable more integrations later from your dashboard settings."
      },
      completion: {
        welcomeTitle: "Welcome to BargainB!",
        welcomeDescWhatsApp: "Your profile is ready! You'll receive a WhatsApp message shortly to start using your AI grocery assistant.",
        welcomeDescDefault: "Your profile is ready! You can start using BargainB anytime by enabling integrations from your settings.",
        profileSummaryTitle: "Your Profile Summary",
        location: "Location",
        groceryStores: "Grocery Stores",
        dietaryPreferences: "Dietary Preferences",
        foodAllergies: "Food Allergies",
        initialGroceryList: "Initial Grocery List",
        aiIntegrations: "AI Integrations",
        items: "items",
        whatsappIntegrationActive: "WhatsApp Integration Active",
        whatsappIntegrationDesc: "Look for a message from BargainB on WhatsApp at",
        whatsappIntegrationDescContinued: "Your AI assistant will help you with grocery shopping, meal planning, and more!",
        completeSetup: "Complete Setup",
        setupCompleteTitle: "Setup Complete!",
        checkWhatsappDesc: "Check your WhatsApp for a message from BargainB!",
        profileCreatedTitle: "Profile Created!",
        enableIntegrationsDesc: "You can enable integrations anytime from settings."
      }
    }
  },
  de: {
    hero: {
      waitingBadge: "Leute warten bereits",
      peopleWaiting: "Leute warten bereits",
      earlyAccess: "Early Access",
      bargainB: "BargainB",
      description: "Erhalten Sie als erste Zugang zur intelligentesten Art, bei Ihren Einkäufen Geld zu sparen.",
      firstAccess: "ersten Zugang",
      exclusiveWhatsApp: "Exklusiv über WhatsApp."
    },
    form: {
      phoneLabel: "Ihre niederländische Handynummer",
      phonePlaceholder: "6 12345678",
      submitButton: "Early Access erhalten 🚀",
      submitting: "Bitte warten...",
      successMessage: "✅ Perfekt! Wir senden eine WhatsApp an",
      successDescription: "Sie stehen jetzt auf der Early Access Liste!"
    },
    socialProof: {
      joinText: "Schließen Sie sich",
      earlyAdopters: "Early Adopters an"
    },
    faq: {
      title: "Häufig gestellte Fragen",
      questions: {
        whatIs: {
          question: "Was ist BargainB Early Access?",
          answer: "Erhalten Sie als erste Zugang zu BargainB und entdecken Sie die besten Supermarkt-Angebote über WhatsApp. Frühe Nutzer erhalten exklusive Vorteile und Rabatte."
        },
        whenAccess: {
          question: "Wann erhalte ich Zugang?",
          answer: "Early Access Nutzer erhalten innerhalb von 2-3 Wochen Zugang zur BargainB Beta. Sie erhalten eine WhatsApp-Nachricht, sobald Ihr Account bereit ist."
        },
        benefits: {
          question: "Was sind die Early Access Vorteile?",
          answer: "Exklusive Rabatte, Premium-Funktionen, vorrangiger Support und die Chance, die Zukunft des intelligenten Lebensmitteleinkaufs mitzugestalten."
        },
        free: {
          question: "Ist Early Access kostenlos?",
          answer: "Ja! Early Access ist völlig kostenlos. Frühe Nutzer erhalten sogar zusätzliche Vorteile und Rabatte, die später nicht mehr verfügbar sind."
        }
      }
    },
    finalCta: {
      question: "Bereit für intelligentes Lebensmitteleinkaufen?",
      action: "Geben Sie Ihre Nummer oben ein"
    },
    validation: {
      phoneLength: "Handynummer muss genau 9 Ziffern haben (6 + 8 Ziffern)",
      phoneFormat: "Handynummer muss mit 6 beginnen",
      phoneNumbers: "Handynummer darf nur Ziffern enthalten"
    },
    toast: {
      success: {
        title: "Glückwunsch! 🎉",
        description: "Sie stehen jetzt auf der Early Access Liste!"
      },
      exists: {
        title: "Sie stehen bereits auf der Liste! 📱",
        description: "Wir senden Ihnen bald eine WhatsApp-Nachricht."
      },
      error: {
        title: "Ups! 😅",
        description: "Bitte versuchen Sie es erneut."
      }
    },
    onboarding: {
      common: {
        back: "Zurück",
        continue: "Weiter",
        required: "Erforderlich",
        optional: "Optional"
      },
      step3: {
        title: "Ihr Standort",
        description: "Helfen Sie uns, Ihre Erfahrung zu personalisieren, indem Sie Ihren Standort teilen.",
        country: "Land",
        city: "Stadt",
        countryPlaceholder: "Wählen Sie Ihr Land",
        cityPlaceholder: "z.B. Amsterdam, Brüssel, Berlin",
        countryHelper: "Wählen Sie das Land, in dem Sie einkaufen werden.",
        cityHelper: "Geben Sie die Stadt ein, in der Sie Lebensmittel einkaufen.",
        countryRequired: "Land ist erforderlich",
        cityRequired: "Stadt ist erforderlich"
      },
      step4: {
        title: "Wählen Sie Ihre Supermärkte",
        description: "Wählen Sie die Supermärkte aus, in denen Sie gerne einkaufen. Sie können mehrere Geschäfte auswählen.",
        selectedStores: "Ausgewählte Geschäfte",
        helpText: "Keine Sorge, Sie können Ihre Präferenzen später jederzeit in den Einstellungen ändern."
      },
      step5: {
        title: "Ernährungsvorlieben & Allergien",
        description: "Helfen Sie uns, Ihr Einkaufserlebnis zu personalisieren, indem Sie Ihre Ernährungsbedürfnisse und Allergien mitteilen.",
        dietaryPreferences: "Ernährungsvorlieben",
        foodAllergies: "Lebensmittelallergien",
        yourSelections: "Ihre Auswahl",
        helpText: "Diese Informationen helfen uns, geeignete Produkte vorzuschlagen und Artikel herauszufiltern, die nicht Ihren Bedürfnissen entsprechen.",
        dietaryOptions: {
          vegetarian: "Vegetarisch",
          vegan: "Vegan",
          glutenFree: "Glutenfrei",
          dairyFree: "Milchfrei",
          keto: "Keto",
          paleo: "Paleo",
          lowSodium: "Natriumarm",
          diabetic: "Diabetiker",
          halal: "Halal",
          kosher: "Koscher"
        },
        allergyOptions: {
          nuts: "Nüsse",
          peanuts: "Erdnüsse",
          dairy: "Milchprodukte",
          eggs: "Eier",
          soy: "Soja",
          gluten: "Gluten",
          shellfish: "Meeresfrüchte",
          fish: "Fisch",
          sesame: "Sesam",
          sulfites: "Sulfite"
        }
      },
      step6: {
        title: "Erstellen Sie Ihre Einkaufsliste",
        description: "Wählen Sie aus vorgefertigten Listen oder laden Sie Fotos Ihres Kühlschranks/Vorratsschranks hoch, um personalisierte Vorschläge zu erhalten.",
        quickStartLists: "Schnellstart-Listen",
        smartAnalysis: "Intelligente Analyse",
        fridgeDescription: "Sehen Sie, was Ihnen ausgeht",
        pantryDescription: "Überprüfen Sie Ihre Vorräte",
        shoppingListDescription: "Laden Sie Ihre geschriebene Liste hoch",
        upload: "Hochladen",
        camera: "Kamera",
        analyzing: "Ihr Bild wird analysiert...",
        aiSuggestions: "KI-Vorschläge",
        yourShoppingList: "Ihre Einkaufsliste",
        helpText: "KI wird Ihre Fotos analysieren, um Artikel vorzuschlagen, die Sie möglicherweise benötigen. Sie können jederzeit Artikel hinzufügen oder entfernen."
      },
      step7: {
        title: "Wählen Sie Ihre KI-Integration",
        description: "Wählen Sie aus, wo Sie Ihren KI-Einkaufsassistenten verwenden möchten. Sie können später jederzeit weitere hinzufügen.",
        availablePlatforms: "Verfügbare Plattformen",
        popular: "Beliebt",
        comingSoon: "Demnächst verfügbar",
        selected: "Ausgewählt",
        selectedIntegrations: "Ausgewählte Integrationen",
        whatsappBenefits: "📱 WhatsApp-Integration Vorteile:",
        benefit1: "• Erhalten Sie sofortige Einkaufsvorschläge",
        benefit2: "• Teilen Sie Fotos für intelligente Einkaufslisten",
        benefit3: "• Erhalten Sie personalisierte Mahlzeitempfehlungen",
        benefit4: "• Verfolgen Sie Ihren Einkaufsfortschritt",
        skipForNow: "Vorerst überspringen",
        helpText: "Keine Sorge! Sie können später jederzeit weitere Integrationen in Ihren Dashboard-Einstellungen aktivieren."
      },
      completion: {
        welcomeTitle: "Willkommen bei BargainB!",
        welcomeDescWhatsApp: "Ihr Profil ist bereit! Sie erhalten in Kürze eine WhatsApp-Nachricht, um Ihren KI-Einkaufsassistenten zu nutzen.",
        welcomeDescDefault: "Ihr Profil ist bereit! Sie können BargainB jederzeit nutzen, indem Sie Integrationen in Ihren Einstellungen aktivieren.",
        profileSummaryTitle: "Ihre Profilübersicht",
        location: "Standort",
        groceryStores: "Supermärkte",
        dietaryPreferences: "Ernährungsvorlieben",
        foodAllergies: "Nahrungsmittelallergien",
        initialGroceryList: "Erste Einkaufsliste",
        aiIntegrations: "KI-Integrationen",
        items: "Artikel",
        whatsappIntegrationActive: "WhatsApp-Integration aktiv",
        whatsappIntegrationDesc: "Suchen Sie nach einer Nachricht von BargainB auf WhatsApp unter",
        whatsappIntegrationDescContinued: "Ihr KI-Assistent hilft Ihnen beim Einkaufen, bei der Essensplanung und mehr!",
        completeSetup: "Setup abschließen",
        setupCompleteTitle: "Setup abgeschlossen!",
        checkWhatsappDesc: "Prüfen Sie Ihr WhatsApp auf eine Nachricht von BargainB!",
        profileCreatedTitle: "Profil erstellt!",
        enableIntegrationsDesc: "Sie können Integrationen jederzeit in den Einstellungen aktivieren."
      }
    }
  },
  fr: {
    hero: {
      waitingBadge: "personnes attendent déjà",
      peopleWaiting: "personnes attendent déjà",
      earlyAccess: "Accès Anticipé",
      bargainB: "BargainB",
      description: "Obtenez un accès prioritaire à la façon la plus intelligente d'économiser sur vos courses.",
      firstAccess: "premier accès",
      exclusiveWhatsApp: "Exclusivement via WhatsApp."
    },
    form: {
      phoneLabel: "Votre numéro de mobile néerlandais",
      phonePlaceholder: "6 12345678",
      submitButton: "Obtenir l'Accès Anticipé 🚀",
      submitting: "Veuillez patienter...",
      successMessage: "✅ Parfait! Nous enverrons un WhatsApp à",
      successDescription: "Vous êtes maintenant sur la liste d'accès anticipé!"
    },
    socialProof: {
      joinText: "Rejoignez",
      earlyAdopters: "early adopters"
    },
    faq: {
      title: "Questions Fréquemment Posées",
      questions: {
        whatIs: {
          question: "Qu'est-ce que BargainB Accès Anticipé?",
          answer: "Obtenez un accès prioritaire à BargainB et découvrez les meilleures offres de supermarché via WhatsApp. Les utilisateurs précoces obtiennent des avantages exclusifs et des remises."
        },
        whenAccess: {
          question: "Quand aurai-je accès?",
          answer: "Les utilisateurs de l'Accès Anticipé obtiennent l'accès à la version bêta de BargainB dans les 2-3 semaines. Vous recevrez un message WhatsApp dès que votre compte sera prêt."
        },
        benefits: {
          question: "Quels sont les avantages de l'Accès Anticipé?",
          answer: "Remises exclusives, fonctionnalités premium, support prioritaire, et la chance d'aider à construire l'avenir des courses intelligentes."
        },
        free: {
          question: "L'Accès Anticipé est-il gratuit?",
          answer: "Oui! L'Accès Anticipé est entièrement gratuit. Les utilisateurs précoces obtiennent même des avantages supplémentaires et des remises qui ne seront plus disponibles plus tard."
        }
      }
    },
    finalCta: {
      question: "Prêt à commencer les courses intelligentes?",
      action: "Entrez votre numéro ci-dessus"
    },
    validation: {
      phoneLength: "Le numéro mobile doit contenir exactement 9 chiffres (6 + 8 chiffres)",
      phoneFormat: "Le numéro mobile doit commencer par 6",
      phoneNumbers: "Le numéro mobile ne peut contenir que des chiffres"
    },
    toast: {
      success: {
        title: "Félicitations! 🎉",
        description: "Vous êtes maintenant sur la liste d'accès anticipé!"
      },
      exists: {
        title: "Vous êtes déjà sur la liste! 📱",
        description: "Nous vous enverrons bientôt un message WhatsApp."
      },
      error: {
        title: "Oups! 😅",
        description: "Veuillez réessayer."
      }
    },
    onboarding: {
      common: {
        back: "Retour",
        continue: "Continuer",
        required: "Requis",
        optional: "Optionnel"
      },
      step3: {
        title: "Votre Localisation",
        description: "Aidez-nous à personnaliser votre expérience en partageant votre localisation.",
        country: "Pays",
        city: "Ville",
        countryPlaceholder: "Sélectionnez votre pays",
        cityPlaceholder: "p.ex. Amsterdam, Bruxelles, Berlin",
        countryHelper: "Sélectionnez le pays où vous ferez vos courses.",
        cityHelper: "Entrez la ville où vous ferez vos courses alimentaires.",
        countryRequired: "Le pays est requis",
        cityRequired: "La ville est requise"
      },
      step4: {
        title: "Choisissez Vos Supermarchés",
        description: "Sélectionnez les supermarchés où vous aimez faire vos courses. Vous pouvez choisir plusieurs magasins.",
        selectedStores: "Magasins Sélectionnés",
        helpText: "Ne vous inquiétez pas, vous pouvez toujours modifier vos préférences plus tard dans les paramètres."
      },
      step5: {
        title: "Préférences Alimentaires & Allergies",
        description: "Aidez-nous à personnaliser votre expérience d'achat en partageant vos besoins alimentaires et allergies.",
        dietaryPreferences: "Préférences Alimentaires",
        foodAllergies: "Allergies Alimentaires",
        yourSelections: "Vos Sélections",
        helpText: "Ces informations nous aident à suggérer des produits appropriés et à filtrer les articles qui ne correspondent pas à vos besoins.",
        dietaryOptions: {
          vegetarian: "Végétarien",
          vegan: "Végan",
          glutenFree: "Sans gluten",
          dairyFree: "Sans lait",
          keto: "Keto",
          paleo: "Paleo",
          lowSodium: "Faible en sel",
          diabetic: "Diabétique",
          halal: "Halal",
          kosher: "Kosher"
        },
        allergyOptions: {
          nuts: "Noix",
          peanuts: "Arachides",
          dairy: "Lait",
          eggs: "Oeufs",
          soy: "Soja",
          gluten: "Gluten",
          shellfish: "Crustacés",
          fish: "Poisson",
          sesame: "Sésame",
          sulfites: "Sulfites"
        }
      },
      step6: {
        title: "Créez Votre Liste de Courses",
        description: "Choisissez parmi des listes prêtes ou téléchargez des photos de votre frigo/garde-manger pour obtenir des suggestions personnalisées.",
        quickStartLists: "Listes de Démarrage Rapide",
        smartAnalysis: "Analyse Intelligente",
        fridgeDescription: "Voyez ce qui vous manque",
        pantryDescription: "Vérifiez vos provisions",
        shoppingListDescription: "Téléchargez votre liste écrite",
        upload: "Télécharger",
        camera: "Caméra",
        analyzing: "Analyse de votre image...",
        aiSuggestions: "Suggestions IA",
        yourShoppingList: "Votre Liste de Courses",
        helpText: "L'IA analysera vos photos pour suggérer des articles dont vous pourriez avoir besoin. Vous pouvez toujours ajouter ou supprimer des articles."
      },
      step7: {
        title: "Choisissez Votre Intégration IA",
        description: "Sélectionnez où vous aimeriez utiliser votre assistant d'achat IA. Vous pouvez toujours en ajouter plus tard.",
        availablePlatforms: "Plateformes Disponibles",
        popular: "Populaire",
        comingSoon: "Bientôt Disponible",
        selected: "Sélectionné",
        selectedIntegrations: "Intégrations Sélectionnées",
        whatsappBenefits: "📱 Avantages de l'Intégration WhatsApp:",
        benefit1: "• Obtenez des suggestions d'achat instantanées",
        benefit2: "• Partagez des photos pour des listes de courses intelligentes",
        benefit3: "• Recevez des recommandations de repas personnalisées",
        benefit4: "• Suivez votre progression d'achat",
        skipForNow: "Ignorer pour l'instant",
        helpText: "Ne vous inquiétez pas! Vous pouvez toujours activer plus d'intégrations plus tard depuis vos paramètres de tableau de bord."
      },
      completion: {
        welcomeTitle: "Bienvenue chez BargainB !",
        welcomeDescWhatsApp: "Votre profil est prêt ! Vous recevrez bientôt un message WhatsApp pour commencer à utiliser votre assistant IA de courses.",
        welcomeDescDefault: "Votre profil est prêt ! Vous pouvez commencer à utiliser BargainB à tout moment en activant les intégrations depuis vos paramètres.",
        profileSummaryTitle: "Résumé de votre profil",
        location: "Localisation",
        groceryStores: "Supermarchés",
        dietaryPreferences: "Préférences alimentaires",
        foodAllergies: "Allergies alimentaires",
        initialGroceryList: "Liste de courses initiale",
        aiIntegrations: "Intégrations IA",
        items: "articles",
        whatsappIntegrationActive: "Intégration WhatsApp active",
        whatsappIntegrationDesc: "Recherchez un message de BargainB sur WhatsApp au",
        whatsappIntegrationDescContinued: "Votre assistant IA vous aidera avec vos courses, la planification des repas et plus encore !",
        completeSetup: "Terminer la configuration",
        setupCompleteTitle: "Configuration terminée !",
        checkWhatsappDesc: "Vérifiez votre WhatsApp pour un message de BargainB !",
        profileCreatedTitle: "Profil créé !",
        enableIntegrationsDesc: "Vous pouvez activer les intégrations à tout moment depuis les paramètres."
      }
    }
  },
  it: {
    hero: {
      waitingBadge: "persone stanno già aspettando",
      peopleWaiting: "persone stanno già aspettando",
      earlyAccess: "Accesso Anticipato",
      bargainB: "BargainB",
      description: "Ottieni il primo accesso al modo più intelligente per risparmiare sulla spesa.",
      firstAccess: "primo accesso",
      exclusiveWhatsApp: "Esclusivamente tramite WhatsApp."
    },
    form: {
      phoneLabel: "Il tuo numero mobile olandese",
      phonePlaceholder: "6 12345678",
      submitButton: "Ottieni Accesso Anticipato 🚀",
      submitting: "Attendere prego...",
      successMessage: "✅ Perfetto! Invieremo un WhatsApp a",
      successDescription: "Ora sei nella lista di accesso anticipato!"
    },
    socialProof: {
      joinText: "Unisciti a",
      earlyAdopters: "early adopters"
    },
    faq: {
      title: "Domande Frequenti",
      questions: {
        whatIs: {
          question: "Cos'è BargainB Accesso Anticipato?",
          answer: "Ottieni il primo accesso a BargainB e scopri le migliori offerte del supermercato tramite WhatsApp. Gli utenti precoci ottengono vantaggi esclusivi e sconti."
        },
        whenAccess: {
          question: "Quando avrò accesso?",
          answer: "Gli utenti dell'Accesso Anticipato ottengono l'accesso alla beta di BargainB entro 2-3 settimane. Riceverai un messaggio WhatsApp non appena il tuo account sarà pronto."
        },
        benefits: {
          question: "Quali sono i vantaggi dell'Accesso Anticipato?",
          answer: "Sconti esclusivi, funzionalità premium, supporto prioritario e la possibilità di aiutare a costruire il futuro della spesa intelligente."
        },
        free: {
          question: "L'Accesso Anticipato è gratuito?",
          answer: "Sì! L'Accesso Anticipato è completamente gratuito. Gli utenti precoci ottengono anche vantaggi extra e sconti che non saranno più disponibili in seguito."
        }
      }
    },
    finalCta: {
      question: "Pronto per iniziare la spesa intelligente?",
      action: "Inserisci il tuo numero sopra"
    },
    validation: {
      phoneLength: "Il numero mobile deve contenere esattamente 9 cifre (6 + 8 cifre)",
      phoneFormat: "Il numero mobile deve iniziare con 6",
      phoneNumbers: "Il numero mobile può contenere solo cifre"
    },
    toast: {
      success: {
        title: "Congratulazioni! 🎉",
        description: "Ora sei nella lista di accesso anticipato!"
      },
      exists: {
        title: "Sei già nella lista! 📱",
        description: "Ti invieremo presto un messaggio WhatsApp."
      },
      error: {
        title: "Ops! 😅",
        description: "Riprova per favore."
      }
    },
    onboarding: {
      common: {
        back: "Indietro",
        continue: "Continua",
        required: "Richiesto",
        optional: "Opzionale"
      },
      step3: {
        title: "La Tua Posizione",
        description: "Aiutaci a personalizzare la tua esperienza condividendo la tua posizione.",
        country: "Paese",
        city: "Città",
        countryPlaceholder: "Seleziona il tuo paese",
        cityPlaceholder: "es. Amsterdam, Bruxelles, Berlino",
        countryHelper: "Seleziona il paese dove farai la spesa.",
        cityHelper: "Inserisci la città dove farai la spesa alimentare.",
        countryRequired: "Il paese è richiesto",
        cityRequired: "La città è richiesta"
      },
      step4: {
        title: "Scegli i Tuoi Supermercati",
        description: "Seleziona i supermercati dove ti piace fare la spesa. Puoi scegliere più negozi.",
        selectedStores: "Negozi Selezionati",
        helpText: "Non preoccuparti, puoi sempre modificare le tue preferenze più tardi nelle impostazioni."
      },
      step5: {
        title: "Preferenze Dietetiche & Allergie",
        description: "Aiutaci a personalizzare la tua esperienza di acquisto condividendo le tue esigenze dietetiche e allergie.",
        dietaryPreferences: "Preferenze Dietetiche",
        foodAllergies: "Allergie Alimentari",
        yourSelections: "Le Tue Selezioni",
        helpText: "Queste informazioni ci aiutano a suggerire prodotti adatti e filtrare articoli che non corrispondono alle tue esigenze.",
        dietaryOptions: {
          vegetarian: "Vegetariano",
          vegan: "Vegano",
          glutenFree: "Senza glutine",
          dairyFree: "Senza lattosio",
          keto: "Keto",
          paleo: "Paleo",
          lowSodium: "Basso in sodio",
          diabetic: "Diabetico",
          halal: "Halal",
          kosher: "Kosher"
        },
        allergyOptions: {
          nuts: "Noce",
          peanuts: "Arachidi",
          dairy: "Lattiero-caseo",
          eggs: "Uova",
          soy: "Soia",
          gluten: "Glutine",
          shellfish: "Molluschi",
          fish: "Pesce",
          sesame: "Sesamo",
          sulfites: "Solfiti"
        }
      },
      step6: {
        title: "Crea la Tua Lista della Spesa",
        description: "Scegli tra liste pronte o carica foto del tuo frigo/dispensa per ottenere suggerimenti personalizzati.",
        quickStartLists: "Liste di Avvio Rapido",
        smartAnalysis: "Analisi Intelligente",
        fridgeDescription: "Vedi cosa ti sta finendo",
        pantryDescription: "Controlla le tue scorte",
        shoppingListDescription: "Carica la tua lista scritta",
        upload: "Carica",
        camera: "Fotocamera",
        analyzing: "Analizzando la tua immagine...",
        aiSuggestions: "Suggerimenti IA",
        yourShoppingList: "La Tua Lista della Spesa",
        helpText: "L'IA analizzerà le tue foto per suggerire articoli di cui potresti aver bisogno. Puoi sempre aggiungere o rimuovere articoli."
      },
      step7: {
        title: "Scegli la Tua Integrazione IA",
        description: "Seleziona dove vorresti usare il tuo assistente per la spesa IA. Puoi sempre aggiungerne altri più tardi.",
        availablePlatforms: "Piattaforme Disponibili",
        popular: "Popolare",
        comingSoon: "Prossimamente",
        selected: "Selezionato",
        selectedIntegrations: "Integrazioni Selezionate",
        whatsappBenefits: "📱 Vantaggi dell'Integrazione WhatsApp:",
        benefit1: "• Ottieni suggerimenti per la spesa istantanei",
        benefit2: "• Condividi foto per liste della spesa intelligenti",
        benefit3: "• Ricevi raccomandazioni di pasti personalizzate",
        benefit4: "• Tieni traccia dei tuoi progressi di acquisto",
        skipForNow: "Salta per Ora",
        helpText: "Non preoccuparti! Puoi sempre abilitare più integrazioni più tardi dalle impostazioni del tuo dashboard."
      },
      completion: {
        welcomeTitle: "Benvenuto in BargainB!",
        welcomeDescWhatsApp: "Il tuo profilo è pronto! Riceverai presto un messaggio WhatsApp per iniziare a usare il tuo assistente IA per la spesa.",
        welcomeDescDefault: "Il tuo profilo è pronto! Puoi iniziare a usare BargainB in qualsiasi momento abilitando le integrazioni dalle tue impostazioni.",
        profileSummaryTitle: "Riepilogo del tuo profilo",
        location: "Posizione",
        groceryStores: "Supermercati",
        dietaryPreferences: "Preferenze dietetiche",
        foodAllergies: "Allergie alimentari",
        initialGroceryList: "Lista della spesa iniziale",
        aiIntegrations: "Integrazioni IA",
        items: "articoli",
        whatsappIntegrationActive: "Integrazione WhatsApp attiva",
        whatsappIntegrationDesc: "Cerca un messaggio da BargainB su WhatsApp al",
        whatsappIntegrationDescContinued: "Il tuo assistente IA ti aiuterà con la spesa, la pianificazione dei pasti e altro ancora!",
        completeSetup: "Completa configurazione",
        setupCompleteTitle: "Configurazione completata!",
        checkWhatsappDesc: "Controlla il tuo WhatsApp per un messaggio da BargainB!",
        profileCreatedTitle: "Profilo creato!",
        enableIntegrationsDesc: "Puoi abilitare le integrazioni in qualsiasi momento dalle impostazioni."
      }
    }
  },
  es: {
    hero: {
      waitingBadge: "personas ya están esperando",
      peopleWaiting: "personas ya están esperando",
      earlyAccess: "Acceso Anticipado",
      bargainB: "BargainB",
      description: "Obtén el primer acceso a la forma más inteligente de ahorrar dinero en tus compras.",
      firstAccess: "primer acceso",
      exclusiveWhatsApp: "Exclusivamente a través de WhatsApp."
    },
    form: {
      phoneLabel: "Tu número móvil holandés",
      phonePlaceholder: "6 12345678",
      submitButton: "Obtener Acceso Anticipado 🚀",
      submitting: "Por favor espera...",
      successMessage: "✅ ¡Perfecto! Enviaremos un WhatsApp a",
      successDescription: "¡Ahora estás en la lista de acceso anticipado!"
    },
    socialProof: {
      joinText: "Únete a",
      earlyAdopters: "early adopters"
    },
    faq: {
      title: "Preguntas Frecuentes",
      questions: {
        whatIs: {
          question: "¿Qué es BargainB Acceso Anticipado?",
          answer: "Obtén el primer acceso a BargainB y descubre las mejores ofertas de supermercado a través de WhatsApp. Los usuarios tempranos obtienen beneficios exclusivos y descuentos."
        },
        whenAccess: {
          question: "¿Cuándo tendré acceso?",
          answer: "Los usuarios de Acceso Anticipado obtienen acceso a la beta de BargainB dentro de 2-3 semanas. Recibirás un mensaje de WhatsApp tan pronto como tu cuenta esté lista."
        },
        benefits: {
          question: "¿Cuáles son los beneficios del Acceso Anticipado?",
          answer: "Descuentos exclusivos, funciones premium, soporte prioritario y la oportunidad de ayudar a construir el futuro de las compras inteligentes."
        },
        free: {
          question: "¿Es gratuito el Acceso Anticipado?",
          answer: "¡Sí! El Acceso Anticipado es completamente gratuito. Los usuarios tempranos incluso obtienen beneficios adicionales y descuentos que no estarán disponibles más tarde."
        }
      }
    },
    finalCta: {
      question: "¿Listo para comenzar las compras inteligentes?",
      action: "Ingresa tu número arriba"
    },
    validation: {
      phoneLength: "El número móvil debe tener exactamente 9 dígitos (6 + 8 dígitos)",
      phoneFormat: "El número móvil debe comenzar con 6",
      phoneNumbers: "El número móvil solo puede contener dígitos"
    },
    toast: {
      success: {
        title: "¡Felicitaciones! 🎉",
        description: "¡Ahora estás en la lista de acceso anticipado!"
      },
      exists: {
        title: "¡Ya estás en la lista! 📱",
        description: "Te enviaremos un mensaje de WhatsApp pronto."
      },
      error: {
        title: "¡Ups! 😅",
        description: "Por favor inténtalo de nuevo."
      }
    },
    onboarding: {
      common: {
        back: "Atrás",
        continue: "Continuar",
        required: "Requerido",
        optional: "Opcional"
      },
      step3: {
        title: "Tu Ubicación",
        description: "Ayúdanos a personalizar tu experiencia compartiendo tu ubicación.",
        country: "País",
        city: "Ciudad",
        countryPlaceholder: "Selecciona tu país",
        cityPlaceholder: "ej. Ámsterdam, Bruselas, Berlín",
        countryHelper: "Selecciona el país donde harás tus compras.",
        cityHelper: "Ingresa la ciudad donde harás tus compras de alimentos.",
        countryRequired: "El país es requerido",
        cityRequired: "La ciudad es requerida"
      },
      step4: {
        title: "Elige Tus Supermercados",
        description: "Selecciona los supermercados donde te gusta comprar. Puedes elegir múltiples tiendas.",
        selectedStores: "Tiendas Seleccionadas",
        helpText: "No te preocupes, siempre puedes cambiar tus preferencias más tarde en la configuración."
      },
      step5: {
        title: "Preferencias Dietéticas y Alergias",
        description: "Ayúdanos a personalizar tu experiencia de compra compartiendo tus necesidades dietéticas y alergias.",
        dietaryPreferences: "Preferencias Dietéticas",
        foodAllergies: "Alergias Alimentarias",
        yourSelections: "Tus Selecciones",
        helpText: "Esta información nos ayuda a sugerir productos adecuados y filtrar artículos que no coinciden con tus necesidades.",
        dietaryOptions: {
          vegetarian: "Vegetariano",
          vegan: "Vegano",
          glutenFree: "Sin gluten",
          dairyFree: "Sin lactosa",
          keto: "Keto",
          paleo: "Paleo",
          lowSodium: "Bajo en sodio",
          diabetic: "Diabético",
          halal: "Halal",
          kosher: "Kosher"
        },
        allergyOptions: {
          nuts: "Frutos secos",
          peanuts: "Cacahuetes",
          dairy: "Lácteos",
          eggs: "Huevos",
          soy: "Soja",
          gluten: "Gluten",
          shellfish: "Moluscos",
          fish: "Pescado",
          sesame: "Sésamo",
          sulfites: "Sulfatos"
        }
      },
      step6: {
        title: "Construye Tu Lista de Compras",
        description: "Elige entre listas predefinidas o sube fotos de tu nevera/despensa para obtener sugerencias personalizadas.",
        quickStartLists: "Listas de Inicio Rápido",
        smartAnalysis: "Análisis Inteligente",
        fridgeDescription: "Ve lo que se te está acabando",
        pantryDescription: "Revisa tus productos básicos",
        shoppingListDescription: "Sube tu lista escrita",
        upload: "Subir",
        camera: "Cámara",
        analyzing: "Analizando tu imagen...",
        aiSuggestions: "Sugerencias de IA",
        yourShoppingList: "Tu Lista de Compras",
        helpText: "La IA analizará tus fotos para sugerir artículos que podrías necesitar. Siempre puedes agregar o quitar artículos."
      },
      step7: {
        title: "Elige Tu Integración de IA",
        description: "Selecciona dónde te gustaría usar tu asistente de compras de IA. Siempre puedes agregar más más tarde.",
        availablePlatforms: "Plataformas Disponibles",
        popular: "Popular",
        comingSoon: "Próximamente",
        selected: "Seleccionado",
        selectedIntegrations: "Integraciones Seleccionadas",
        whatsappBenefits: "📱 Beneficios de la Integración de WhatsApp:",
        benefit1: "• Obtén sugerencias de compras instantáneas",
        benefit2: "• Comparte fotos para listas de compras inteligentes",
        benefit3: "• Recibe recomendaciones de comidas personalizadas",
        benefit4: "• Rastrea tu progreso de compras",
        skipForNow: "Omitir por Ahora",
        helpText: "¡No te preocupes! Siempre puedes habilitar más integraciones más tarde desde la configuración de tu panel."
      },
      completion: {
        welcomeTitle: "¡Bienvenido a BargainB!",
        welcomeDescWhatsApp: "¡Tu perfil está listo! Recibirás un mensaje de WhatsApp en breve para empezar a usar tu asistente IA de compras.",
        welcomeDescDefault: "¡Tu perfil está listo! Puedes empezar a usar BargainB en cualquier momento habilitando integraciones desde tu configuración.",
        profileSummaryTitle: "Resumen de tu perfil",
        location: "Ubicación",
        groceryStores: "Supermercados",
        dietaryPreferences: "Preferencias dietéticas",
        foodAllergies: "Alergias alimentarias",
        initialGroceryList: "Lista de compras inicial",
        aiIntegrations: "Integraciones IA",
        items: "artículos",
        whatsappIntegrationActive: "Integración de WhatsApp activa",
        whatsappIntegrationDesc: "Busca un mensaje de BargainB en WhatsApp en",
        whatsappIntegrationDescContinued: "¡Tu asistente IA te ayudará con las compras, planificación de comidas y más!",
        completeSetup: "Completar configuración",
        setupCompleteTitle: "¡Configuración completada!",
        checkWhatsappDesc: "¡Revisa tu WhatsApp para un mensaje de BargainB!",
        profileCreatedTitle: "¡Perfil creado!",
        enableIntegrationsDesc: "Puedes habilitar integraciones en cualquier momento desde la configuración."
      }
    }
  }
}

export const getTranslation = (lang: LanguageCode): Translations => {
  return translations[lang] || translations.nl
} 