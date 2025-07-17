import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Language-specific instructions
const getLanguageInstructions = (language: string) => {
  const instructions = {
    nl: "Geef alleen een JSON array terug met boodschappenartikelen in het Nederlands",
    en: "Return ONLY a JSON array of grocery items in English", 
    de: "Geben Sie nur ein JSON-Array von Lebensmitteln auf Deutsch zurück",
    fr: "Retournez SEULEMENT un tableau JSON d'articles d'épicerie en français",
    it: "Restituisci SOLO un array JSON di articoli di generi alimentari in italiano",
    es: "Devuelve SOLO un array JSON de artículos de comestibles en español"
  };
  return instructions[language as keyof typeof instructions] || instructions.en;
};

// Example responses for different languages
const getExampleResponse = (language: string) => {
  const examples = {
    nl: '["Melk", "Eieren", "Brood", "Bananen", "Kipfilet", "Rijst", "Olijfolie"]',
    en: '["Milk", "Eggs", "Bread", "Bananas", "Chicken breast", "Rice", "Olive oil"]',
    de: '["Milch", "Eier", "Brot", "Bananen", "Hühnerbrust", "Reis", "Olivenöl"]',
    fr: '["Lait", "Oeufs", "Pain", "Bananes", "Blanc de poulet", "Riz", "Huile d\'olive"]',
    it: '["Latte", "Uova", "Pane", "Banane", "Petto di pollo", "Riso", "Olio d\'oliva"]',
    es: '["Leche", "Huevos", "Pan", "Plátanos", "Pechuga de pollo", "Arroz", "Aceite de oliva"]'
  };
  return examples[language as keyof typeof examples] || examples.en;
};

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const { image, category, prompt, language = 'en' } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: 'No category provided' }, { status: 400 })
    }

    // Create a detailed prompt based on the category and language
    const languageInstruction = getLanguageInstructions(language)
    const exampleResponse = getExampleResponse(language)

    const systemPrompt = `You are an expert grocery shopping assistant. Analyze the provided image and create a comprehensive grocery shopping list based on what you see. 

Instructions:
1. Look at the image carefully and identify all visible food items, ingredients, and household products
2. For fridge images: Focus on items that are running low, expired, or missing common staples
3. For pantry images: Identify items that need restocking or are commonly paired with visible items
4. For shopping list images: Extract all written items and suggest complementary items
5. ${languageInstruction}
6. Focus on practical, commonly available grocery items
7. Avoid overly specific brands unless clearly visible
8. Include fresh produce, dairy, meat, pantry staples, and household items as appropriate
9. Respond in ${language.toUpperCase()} language only

Example response format:
${exampleResponse}

Category: ${category}
Language: ${language}
Specific prompt: ${prompt}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the correct model name
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `${prompt}. Please respond with grocery items in ${language.toUpperCase()} language only.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 })
    }

    // Try to parse the JSON response
    let items: string[] = []
    try {
      // Extract JSON from the response if it's wrapped in other text
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: split by lines and clean up
        items = content
          .split('\n')
          .map((line: string) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
          .filter((line: string) => line.length > 0 && !line.startsWith('[') && !line.startsWith(']'))
          .slice(0, 20) // Limit to 20 items
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      // Fallback parsing
      items = content
        .split('\n')
        .map((line: string) => line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter((line: string) => line.length > 0)
        .slice(0, 20)
    }

    // Clean up items
    items = items
      .map((item: string) => item.replace(/['"]/g, '').trim())
      .filter((item: string) => item.length > 0)
      .slice(0, 20)

    return NextResponse.json({ 
      items,
      category,
      language,
      analysis: content 
    })

  } catch (error) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    )
  }
} 