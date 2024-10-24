'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Search, AlertTriangle, Camera, Moon, Sun, Globe } from 'lucide-react'
import { features } from 'process'
import { List } from 'postcss/lib/list'
import FeaturesList from '../components/FeaturesList.js';


const translations = {
  en: {
    title: "Bird Identifier",
    description: "Discover and identify birds in your surroundings.",
    uploadImage: "Upload Image",
    useCamera: "Use Camera",
    captureImage: "Capture Image",
    identifyBird: "Identify Bird",
    identifying: "Identifying...",
    languageSelector: "Select Language",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    features: "Features",
  },
  es: {
    title: "Identificador de Aves",
    description: "Descubre e identifica aves en tu entorno.",
    uploadImage: "Subir Imagen",
    useCamera: "Usar Cámara",
    captureImage: "Capturar Imagen",
    identifyBird: "Identificar Ave",
    identifying: "Identificando...",
    languageSelector: "Seleccionar Idioma",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    features: "Características",
  },
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null)
  const [result, setResult] = useState<{ name: string; description: string; characteristics: Array<any> } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [darkMode, setDarkMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const t = translations[language]

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setError(null)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowCamera(true)
      }
    } catch (err) {
      console.error("Error accessing the camera", err)
      setError("Unable to access the camera. Please make sure you've granted the necessary permissions.")
    }
  }, [])

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageDataUrl = canvasRef.current.toDataURL('image/jpeg')
        setImage(imageDataUrl)
        setShowCamera(false)
        // Stop all video streams
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const identifyBird = async () => {
    if (!image) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image, language }),
      })
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }
      setResult(data)
    } catch (error) {
      console.error('Error identifying bird:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
              className={`p-2 rounded ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <p className="text-center mb-8">{t.description}</p>
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-4 py-2 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-300`}
          >
            <Upload className="h-5 w-5 inline mr-2" />
            {t.uploadImage}
          </button>
          <button
            onClick={startCamera}
            className={`px-4 py-2 rounded-full ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors duration-300`}
          >
            <Camera className="h-5 w-5 inline mr-2" />
            {t.useCamera}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {showCamera && (
          <div className="relative mb-8">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
            <button
              onClick={captureImage}
              className={`mt-4 px-4 py-2 rounded-full ${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white absolute bottom-4 left-1/2 transform -translate-x-1/2 transition-colors duration-300`}
            >
              {t.captureImage}
            </button>
          </div>
        )}
        {image && !showCamera && (
          <div className="mb-8">
            <div className="relative w-full max-w-2xl mx-auto aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <Image
                src={image}
                alt="Uploaded or captured bird"
                layout="fill"
                objectFit="contain"
                className="rounded-lg"
              />
            </div>
            <button
              onClick={identifyBird}
              disabled={loading}
              className={`mt-4 w-full px-4 py-2 rounded-full ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors duration-300 flex items-center justify-center`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.identifying}
                </span>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  {t.identifyBird}
                </>
              )}
            </button>
          </div>
        )}
        {error && (
          <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`} role="alert">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        {result && (
          <div className={`mb-8 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <h2 className="text-xl font-bold mb-2">{result.name}</h2>
            <p>{result.description}</p>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}