/**
 * Comprehensive International Phone Number Utilities
 * Handles all country codes and formats according to ITU-T E.164 standard
 */

// =============================================================================
// COUNTRY CODE MAPPING
// =============================================================================

export const COUNTRY_CODES = {
  // Major countries and their codes
  '1': { name: 'United States/Canada', minLength: 10, maxLength: 10 },
  '7': { name: 'Russia/Kazakhstan', minLength: 10, maxLength: 10 },
  '20': { name: 'Egypt', minLength: 10, maxLength: 10 },
  '27': { name: 'South Africa', minLength: 9, maxLength: 9 },
  '30': { name: 'Greece', minLength: 10, maxLength: 10 },
  '31': { name: 'Netherlands', minLength: 9, maxLength: 9 },
  '32': { name: 'Belgium', minLength: 9, maxLength: 9 },
  '33': { name: 'France', minLength: 9, maxLength: 9 },
  '34': { name: 'Spain', minLength: 9, maxLength: 9 },
  '36': { name: 'Hungary', minLength: 9, maxLength: 9 },
  '39': { name: 'Italy', minLength: 9, maxLength: 11 },
  '40': { name: 'Romania', minLength: 9, maxLength: 9 },
  '41': { name: 'Switzerland', minLength: 9, maxLength: 9 },
  '43': { name: 'Austria', minLength: 10, maxLength: 13 },
  '44': { name: 'United Kingdom', minLength: 10, maxLength: 10 },
  '45': { name: 'Denmark', minLength: 8, maxLength: 8 },
  '46': { name: 'Sweden', minLength: 9, maxLength: 9 },
  '47': { name: 'Norway', minLength: 8, maxLength: 8 },
  '48': { name: 'Poland', minLength: 9, maxLength: 9 },
  '49': { name: 'Germany', minLength: 11, maxLength: 12 },
  '51': { name: 'Peru', minLength: 9, maxLength: 9 },
  '52': { name: 'Mexico', minLength: 10, maxLength: 10 },
  '53': { name: 'Cuba', minLength: 8, maxLength: 8 },
  '54': { name: 'Argentina', minLength: 10, maxLength: 11 },
  '55': { name: 'Brazil', minLength: 10, maxLength: 11 },
  '56': { name: 'Chile', minLength: 9, maxLength: 9 },
  '57': { name: 'Colombia', minLength: 10, maxLength: 10 },
  '58': { name: 'Venezuela', minLength: 10, maxLength: 10 },
  '60': { name: 'Malaysia', minLength: 9, maxLength: 10 },
  '61': { name: 'Australia', minLength: 9, maxLength: 9 },
  '62': { name: 'Indonesia', minLength: 9, maxLength: 12 },
  '63': { name: 'Philippines', minLength: 10, maxLength: 10 },
  '64': { name: 'New Zealand', minLength: 9, maxLength: 9 },
  '65': { name: 'Singapore', minLength: 8, maxLength: 8 },
  '66': { name: 'Thailand', minLength: 9, maxLength: 9 },
  '81': { name: 'Japan', minLength: 10, maxLength: 11 },
  '82': { name: 'South Korea', minLength: 9, maxLength: 11 },
  '84': { name: 'Vietnam', minLength: 9, maxLength: 10 },
  '86': { name: 'China', minLength: 11, maxLength: 11 },
  '90': { name: 'Turkey', minLength: 10, maxLength: 10 },
  '91': { name: 'India', minLength: 10, maxLength: 10 },
  '92': { name: 'Pakistan', minLength: 10, maxLength: 10 },
  '93': { name: 'Afghanistan', minLength: 9, maxLength: 9 },
  '94': { name: 'Sri Lanka', minLength: 9, maxLength: 9 },
  '95': { name: 'Myanmar', minLength: 9, maxLength: 10 },
  '98': { name: 'Iran', minLength: 10, maxLength: 10 },
  '212': { name: 'Morocco', minLength: 9, maxLength: 9 },
  '213': { name: 'Algeria', minLength: 9, maxLength: 9 },
  '216': { name: 'Tunisia', minLength: 8, maxLength: 8 },
  '218': { name: 'Libya', minLength: 9, maxLength: 9 },
  '220': { name: 'Gambia', minLength: 7, maxLength: 7 },
  '221': { name: 'Senegal', minLength: 9, maxLength: 9 },
  '222': { name: 'Mauritania', minLength: 8, maxLength: 8 },
  '223': { name: 'Mali', minLength: 8, maxLength: 8 },
  '224': { name: 'Guinea', minLength: 9, maxLength: 9 },
  '225': { name: 'Ivory Coast', minLength: 8, maxLength: 8 },
  '226': { name: 'Burkina Faso', minLength: 8, maxLength: 8 },
  '227': { name: 'Niger', minLength: 8, maxLength: 8 },
  '228': { name: 'Togo', minLength: 8, maxLength: 8 },
  '229': { name: 'Benin', minLength: 8, maxLength: 8 },
  '230': { name: 'Mauritius', minLength: 8, maxLength: 8 },
  '231': { name: 'Liberia', minLength: 8, maxLength: 9 },
  '232': { name: 'Sierra Leone', minLength: 8, maxLength: 8 },
  '233': { name: 'Ghana', minLength: 9, maxLength: 9 },
  '234': { name: 'Nigeria', minLength: 10, maxLength: 10 },
  '235': { name: 'Chad', minLength: 8, maxLength: 8 },
  '236': { name: 'Central African Republic', minLength: 8, maxLength: 8 },
  '237': { name: 'Cameroon', minLength: 9, maxLength: 9 },
  '238': { name: 'Cape Verde', minLength: 7, maxLength: 7 },
  '239': { name: 'Sao Tome and Principe', minLength: 7, maxLength: 7 },
  '240': { name: 'Equatorial Guinea', minLength: 9, maxLength: 9 },
  '241': { name: 'Gabon', minLength: 8, maxLength: 8 },
  '242': { name: 'Republic of the Congo', minLength: 9, maxLength: 9 },
  '243': { name: 'Democratic Republic of the Congo', minLength: 9, maxLength: 9 },
  '244': { name: 'Angola', minLength: 9, maxLength: 9 },
  '245': { name: 'Guinea-Bissau', minLength: 7, maxLength: 7 },
  '246': { name: 'British Indian Ocean Territory', minLength: 7, maxLength: 7 },
  '247': { name: 'Ascension Island', minLength: 4, maxLength: 4 },
  '248': { name: 'Seychelles', minLength: 7, maxLength: 7 },
  '249': { name: 'Sudan', minLength: 9, maxLength: 9 },
  '250': { name: 'Rwanda', minLength: 9, maxLength: 9 },
  '251': { name: 'Ethiopia', minLength: 9, maxLength: 9 },
  '252': { name: 'Somalia', minLength: 8, maxLength: 9 },
  '253': { name: 'Djibouti', minLength: 8, maxLength: 8 },
  '254': { name: 'Kenya', minLength: 9, maxLength: 9 },
  '255': { name: 'Tanzania', minLength: 9, maxLength: 9 },
  '256': { name: 'Uganda', minLength: 9, maxLength: 9 },
  '257': { name: 'Burundi', minLength: 8, maxLength: 8 },
  '258': { name: 'Mozambique', minLength: 9, maxLength: 9 },
  '260': { name: 'Zambia', minLength: 9, maxLength: 9 },
  '261': { name: 'Madagascar', minLength: 9, maxLength: 9 },
  '262': { name: 'Reunion', minLength: 9, maxLength: 9 },
  '263': { name: 'Zimbabwe', minLength: 9, maxLength: 9 },
  '264': { name: 'Namibia', minLength: 9, maxLength: 9 },
  '265': { name: 'Malawi', minLength: 9, maxLength: 9 },
  '266': { name: 'Lesotho', minLength: 8, maxLength: 8 },
  '267': { name: 'Botswana', minLength: 8, maxLength: 8 },
  '268': { name: 'Swaziland', minLength: 8, maxLength: 8 },
  '269': { name: 'Comoros', minLength: 7, maxLength: 7 },
  '290': { name: 'Saint Helena', minLength: 4, maxLength: 4 },
  '291': { name: 'Eritrea', minLength: 7, maxLength: 7 },
  '297': { name: 'Aruba', minLength: 7, maxLength: 7 },
  '298': { name: 'Faroe Islands', minLength: 6, maxLength: 6 },
  '299': { name: 'Greenland', minLength: 6, maxLength: 6 },
  '350': { name: 'Gibraltar', minLength: 8, maxLength: 8 },
  '351': { name: 'Portugal', minLength: 9, maxLength: 9 },
  '352': { name: 'Luxembourg', minLength: 9, maxLength: 9 },
  '353': { name: 'Ireland', minLength: 9, maxLength: 9 },
  '354': { name: 'Iceland', minLength: 7, maxLength: 7 },
  '355': { name: 'Albania', minLength: 9, maxLength: 9 },
  '356': { name: 'Malta', minLength: 8, maxLength: 8 },
  '357': { name: 'Cyprus', minLength: 8, maxLength: 8 },
  '358': { name: 'Finland', minLength: 9, maxLength: 10 },
  '359': { name: 'Bulgaria', minLength: 9, maxLength: 9 },
  '370': { name: 'Lithuania', minLength: 8, maxLength: 8 },
  '371': { name: 'Latvia', minLength: 8, maxLength: 8 },
  '372': { name: 'Estonia', minLength: 8, maxLength: 8 },
  '373': { name: 'Moldova', minLength: 8, maxLength: 8 },
  '374': { name: 'Armenia', minLength: 8, maxLength: 8 },
  '375': { name: 'Belarus', minLength: 9, maxLength: 9 },
  '376': { name: 'Andorra', minLength: 6, maxLength: 6 },
  '377': { name: 'Monaco', minLength: 8, maxLength: 8 },
  '378': { name: 'San Marino', minLength: 9, maxLength: 10 },
  '380': { name: 'Ukraine', minLength: 9, maxLength: 9 },
  '381': { name: 'Serbia', minLength: 9, maxLength: 9 },
  '382': { name: 'Montenegro', minLength: 8, maxLength: 8 },
  '383': { name: 'Kosovo', minLength: 8, maxLength: 8 },
  '385': { name: 'Croatia', minLength: 9, maxLength: 9 },
  '386': { name: 'Slovenia', minLength: 8, maxLength: 8 },
  '387': { name: 'Bosnia and Herzegovina', minLength: 8, maxLength: 8 },
  '389': { name: 'North Macedonia', minLength: 8, maxLength: 8 }, // Your example: +389 79 340 766
  '420': { name: 'Czech Republic', minLength: 9, maxLength: 9 },
  '421': { name: 'Slovakia', minLength: 9, maxLength: 9 },
  '423': { name: 'Liechtenstein', minLength: 7, maxLength: 7 },
  '500': { name: 'Falkland Islands', minLength: 5, maxLength: 5 },
  '501': { name: 'Belize', minLength: 7, maxLength: 7 },
  '502': { name: 'Guatemala', minLength: 8, maxLength: 8 },
  '503': { name: 'El Salvador', minLength: 8, maxLength: 8 },
  '504': { name: 'Honduras', minLength: 8, maxLength: 8 },
  '505': { name: 'Nicaragua', minLength: 8, maxLength: 8 },
  '506': { name: 'Costa Rica', minLength: 8, maxLength: 8 },
  '507': { name: 'Panama', minLength: 8, maxLength: 8 },
  '508': { name: 'Saint Pierre and Miquelon', minLength: 6, maxLength: 6 },
  '509': { name: 'Haiti', minLength: 8, maxLength: 8 },
  '590': { name: 'Guadeloupe', minLength: 9, maxLength: 9 },
  '591': { name: 'Bolivia', minLength: 8, maxLength: 8 },
  '592': { name: 'Guyana', minLength: 7, maxLength: 7 },
  '593': { name: 'Ecuador', minLength: 9, maxLength: 9 },
  '594': { name: 'French Guiana', minLength: 9, maxLength: 9 },
  '595': { name: 'Paraguay', minLength: 9, maxLength: 9 },
  '596': { name: 'Martinique', minLength: 9, maxLength: 9 },
  '597': { name: 'Suriname', minLength: 7, maxLength: 7 },
  '598': { name: 'Uruguay', minLength: 8, maxLength: 8 },
  '599': { name: 'Netherlands Antilles', minLength: 7, maxLength: 7 },
  '670': { name: 'East Timor', minLength: 8, maxLength: 8 },
  '672': { name: 'Australian External Territories', minLength: 9, maxLength: 9 },
  '673': { name: 'Brunei', minLength: 7, maxLength: 7 },
  '674': { name: 'Nauru', minLength: 7, maxLength: 7 },
  '675': { name: 'Papua New Guinea', minLength: 8, maxLength: 8 },
  '676': { name: 'Tonga', minLength: 7, maxLength: 7 },
  '677': { name: 'Solomon Islands', minLength: 7, maxLength: 7 },
  '678': { name: 'Vanuatu', minLength: 7, maxLength: 7 },
  '679': { name: 'Fiji', minLength: 7, maxLength: 7 },
  '680': { name: 'Palau', minLength: 7, maxLength: 7 },
  '681': { name: 'Wallis and Futuna', minLength: 6, maxLength: 6 },
  '682': { name: 'Cook Islands', minLength: 5, maxLength: 5 },
  '683': { name: 'Niue', minLength: 4, maxLength: 4 },
  '684': { name: 'American Samoa', minLength: 7, maxLength: 7 },
  '685': { name: 'Samoa', minLength: 7, maxLength: 7 },
  '686': { name: 'Kiribati', minLength: 8, maxLength: 8 },
  '687': { name: 'New Caledonia', minLength: 6, maxLength: 6 },
  '688': { name: 'Tuvalu', minLength: 6, maxLength: 6 },
  '689': { name: 'French Polynesia', minLength: 8, maxLength: 8 },
  '690': { name: 'Tokelau', minLength: 4, maxLength: 4 },
  '691': { name: 'Micronesia', minLength: 7, maxLength: 7 },
  '692': { name: 'Marshall Islands', minLength: 7, maxLength: 7 },
  '850': { name: 'North Korea', minLength: 8, maxLength: 10 },
  '852': { name: 'Hong Kong', minLength: 8, maxLength: 8 },
  '853': { name: 'Macao', minLength: 8, maxLength: 8 },
  '855': { name: 'Cambodia', minLength: 9, maxLength: 9 },
  '856': { name: 'Laos', minLength: 10, maxLength: 10 },
  '880': { name: 'Bangladesh', minLength: 10, maxLength: 10 },
  '886': { name: 'Taiwan', minLength: 9, maxLength: 9 },
  '960': { name: 'Maldives', minLength: 7, maxLength: 7 },
  '961': { name: 'Lebanon', minLength: 8, maxLength: 8 },
  '962': { name: 'Jordan', minLength: 9, maxLength: 9 },
  '963': { name: 'Syria', minLength: 9, maxLength: 9 },
  '964': { name: 'Iraq', minLength: 10, maxLength: 10 },
  '965': { name: 'Kuwait', minLength: 8, maxLength: 8 },
  '966': { name: 'Saudi Arabia', minLength: 9, maxLength: 9 },
  '967': { name: 'Yemen', minLength: 9, maxLength: 9 },
  '968': { name: 'Oman', minLength: 8, maxLength: 8 },
  '970': { name: 'Palestine', minLength: 9, maxLength: 9 },
  '971': { name: 'United Arab Emirates', minLength: 9, maxLength: 9 },
  '972': { name: 'Israel', minLength: 9, maxLength: 9 },
  '973': { name: 'Bahrain', minLength: 8, maxLength: 8 },
  '974': { name: 'Qatar', minLength: 8, maxLength: 8 }, // Your example: +974
  '975': { name: 'Bhutan', minLength: 8, maxLength: 8 },
  '976': { name: 'Mongolia', minLength: 8, maxLength: 8 },
  '977': { name: 'Nepal', minLength: 10, maxLength: 10 },
  '992': { name: 'Tajikistan', minLength: 9, maxLength: 9 },
  '993': { name: 'Turkmenistan', minLength: 8, maxLength: 8 },
  '994': { name: 'Azerbaijan', minLength: 9, maxLength: 9 },
  '995': { name: 'Georgia', minLength: 9, maxLength: 9 },
  '996': { name: 'Kyrgyzstan', minLength: 9, maxLength: 9 },
  '998': { name: 'Uzbekistan', minLength: 9, maxLength: 9 }
} as const

// =============================================================================
// PHONE NUMBER PARSING AND VALIDATION
// =============================================================================

/**
 * Parse and normalize phone number to E.164 format
 */
export function parsePhoneNumber(input: string): {
  countryCode: string | null
  nationalNumber: string
  isValid: boolean
  formatted: string
  country: string | null
} {
  if (!input || typeof input !== 'string') {
    return {
      countryCode: null,
      nationalNumber: '',
      isValid: false,
      formatted: '',
      country: null
    }
  }

  // Remove all non-digit characters except +
  let cleaned = input.replace(/[^\d+]/g, '')

  // Handle different input formats
  if (cleaned.startsWith('+')) {
    // Already has + prefix, use as-is
    cleaned = cleaned
  } else if (cleaned.startsWith('00')) {
    // Replace 00 with +
    cleaned = '+' + cleaned.substring(2)
  } else if (cleaned.length >= 7) {
    // No country code prefix, add + but don't assume country
    cleaned = '+' + cleaned
  } else {
    // Too short to be valid
    return {
      countryCode: null,
      nationalNumber: cleaned,
      isValid: false,
      formatted: cleaned,
      country: null
    }
  }

  // Extract country code and national number
  const digitsOnly = cleaned.substring(1) // Remove +
  
  // Try to match country codes (longest first)
  let countryCode: string | null = null
  let nationalNumber = ''
  
  // Sort country codes by length (longest first) to match correctly
  const sortedCountryCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length)
  
  for (const code of sortedCountryCodes) {
    if (digitsOnly.startsWith(code)) {
      countryCode = code
      nationalNumber = digitsOnly.substring(code.length)
      break
    }
  }

  // If no country code found, assume the whole number is the country code + national number
  if (!countryCode) {
    // For unknown country codes, be more lenient
    const possibleCountryCode = digitsOnly.substring(0, 3)
    const possibleNationalNumber = digitsOnly.substring(3)
    
    if (possibleNationalNumber.length >= 4) {
      countryCode = possibleCountryCode
      nationalNumber = possibleNationalNumber
    } else {
      // Try 2-digit country code
      const possibleCountryCode2 = digitsOnly.substring(0, 2)
      const possibleNationalNumber2 = digitsOnly.substring(2)
      
      if (possibleNationalNumber2.length >= 4) {
        countryCode = possibleCountryCode2
        nationalNumber = possibleNationalNumber2
      } else {
        // Try 1-digit country code
        const possibleCountryCode1 = digitsOnly.substring(0, 1)
        const possibleNationalNumber1 = digitsOnly.substring(1)
        
        if (possibleNationalNumber1.length >= 4) {
          countryCode = possibleCountryCode1
          nationalNumber = possibleNationalNumber1
        }
      }
    }
  }

  // Validate the phone number
  const isValid = validateParsedNumber(countryCode, nationalNumber)
  const formatted = isValid ? `+${countryCode}${nationalNumber}` : cleaned
  const country = countryCode && COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES]?.name || null

  return {
    countryCode,
    nationalNumber,
    isValid,
    formatted,
    country
  }
}

/**
 * Validate parsed country code and national number
 */
function validateParsedNumber(countryCode: string | null, nationalNumber: string): boolean {
  if (!countryCode || !nationalNumber) return false
  
  // Check if national number contains only digits
  if (!/^\d+$/.test(nationalNumber)) return false
  
  // Check against known country codes
  const countryInfo = COUNTRY_CODES[countryCode as keyof typeof COUNTRY_CODES]
  if (countryInfo) {
    const length = nationalNumber.length
    return length >= countryInfo.minLength && length <= countryInfo.maxLength
  }
  
  // For unknown country codes, apply general ITU-T E.164 rules
  // Total length should be 7-15 digits (country code + national number)
  const totalLength = countryCode.length + nationalNumber.length
  return totalLength >= 7 && totalLength <= 15 && nationalNumber.length >= 4
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const parsed = parsePhoneNumber(phoneNumber)
  return parsed.formatted
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const parsed = parsePhoneNumber(phoneNumber)
  return parsed.isValid
}

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  const parsed = parsePhoneNumber(phoneNumber)
  return parsed.formatted
}

/**
 * Get country information from phone number
 */
export function getCountryFromPhoneNumber(phoneNumber: string): {
  code: string | null
  name: string | null
} {
  const parsed = parsePhoneNumber(phoneNumber)
  return {
    code: parsed.countryCode,
    name: parsed.country
  }
}

/**
 * Generate WhatsApp JID from phone number
 */
export function phoneToWhatsAppJid(phoneNumber: string): string {
  const parsed = parsePhoneNumber(phoneNumber)
  if (!parsed.isValid) {
    // Fallback for invalid numbers
    const digitsOnly = phoneNumber.replace(/\D/g, '')
    return `${digitsOnly}@s.whatsapp.net`
  }
  
  // Use normalized format without +
  const digitsOnly = parsed.formatted.substring(1)
  return `${digitsOnly}@s.whatsapp.net`
}

/**
 * Extract phone number from WhatsApp JID
 */
export function extractPhoneFromJid(jid: string): string {
  if (!jid) return ''
  
  // Remove WhatsApp domain suffixes
  const cleaned = jid.replace('@s.whatsapp.net', '').replace('@c.us', '')
  
  // Add + prefix if it's all digits
  if (/^\d+$/.test(cleaned)) {
    return `+${cleaned}`
  }
  
  return cleaned
}

// =============================================================================
// EXAMPLE USAGE AND TESTING
// =============================================================================

/**
 * Test the phone number parsing with various formats
 */
export function testPhoneNumbers() {
  const testCases = [
    '+974',                    // Qatar (short)
    '+389 79 340 766',         // North Macedonia  
    '201143515957',            // Egypt without +
    '+20 114 351 5957',        // Egypt with +
    '+31 6 12345678',          // Netherlands
    '+1 555 123 4567',         // US
    '00974 12345678',          // Qatar with 00 prefix
    '+44 20 7946 0958',        // UK
    '+86 138 0013 8000',       // China
    '+91 98765 43210',         // India
  ]

  console.log('=== Phone Number Parsing Tests ===')
  testCases.forEach(test => {
    const result = parsePhoneNumber(test)
    console.log(`Input: "${test}"`)
    console.log(`  Country: ${result.country || 'Unknown'} (${result.countryCode || 'N/A'})`)
    console.log(`  National: ${result.nationalNumber}`)
    console.log(`  Valid: ${result.isValid}`)
    console.log(`  Formatted: ${result.formatted}`)
    console.log(`  WhatsApp JID: ${phoneToWhatsAppJid(test)}`)
    console.log('')
  })
} 