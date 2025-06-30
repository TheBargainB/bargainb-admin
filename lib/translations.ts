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
    }
  }
}

export const getTranslation = (lang: LanguageCode): Translations => {
  return translations[lang] || translations.nl
} 