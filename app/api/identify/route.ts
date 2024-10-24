import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { json } from 'stream/consumers'
import { Bird } from 'lucide-react'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { image, language } = await req.json()
    const base64Image = image.split(',')[1]

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = language === 'es'
      ? "Identifique el ave en esta imagen. Proporcione el nombre común del ave y una breve descripción y viñetas de la característica principal. Formatee en un formato json y los nombres de campos seran los siguientes: name, description, characteristics. Responde en español y no cambiar los nombres de campos"
      : "Identify the bird in this image. Provide the common name of the bird and an brief description and bullet points of the main caracteristic. Format the response as json and fields names: name, description, characteristics. your Answer in english"

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ])

    const response = result.response
    
    const text = response.text()
    // Expresión regular para extraer el bloque JSON
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = text.match(jsonRegex);
    const jsonString = jsonMatch == null ? '' : jsonMatch[0];  // Esto es el JSON en formato de texto
    // Convertir el texto JSON a un objeto JavaScript
    const birdData = JSON.parse(jsonString);
    console.log(birdData);
    
    return NextResponse.json({ name: birdData.name, description: birdData.description, characteristics: birdData.caracteristic })

  } catch (error) {
    console.error('Error in bird identification:', error)

    if (error instanceof Error && error.message.includes('SAFETY')) {
      return NextResponse.json({
        error: 'The image could not be processed due to safety concerns. Please try a different image.',
        details: 'Safety block'
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Failed to identify bird',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}