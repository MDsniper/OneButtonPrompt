import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { Textarea } from './components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Copy, Loader2, Moon, Sun, Check } from 'lucide-react'
import './globals.css'

// Artist and image type arrays
const artists = [
  "Greg Rutkowski", "Artgerm", "Alphonse Mucha", "Studio Ghibli", "James Gurney", "Frank Frazetta",
  "Beeple", "Peter Mohrbacher", "Ross Tran", "Makoto Shinkai", "Ilya Kuvshinov", "Lois van Baarle"
]

const imageTypes = [
  "digital painting", "oil painting", "watercolor", "3D render", "photograph", "concept art",
  "matte painting", "splash art", "cover art", "hyperrealistic", "photorealistic", "surrealism"
]

interface ModelInfo {
  display_name: string
  description: string
  optimal_prompt_style: string
  supports_negative_prompts: boolean
  supports_weights: boolean
  recommended_settings: any
}

interface GeneratedPrompt {
  prompt: string
  negative_prompt?: string
  model: string
  settings?: any
}

function App() {
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [selectedModel, setSelectedModel] = useState('sdxl')
  const [batchMode, setBatchMode] = useState(false)
  const [prompts, setPrompts] = useState<Record<string, GeneratedPrompt>>({})
  const [darkMode, setDarkMode] = useState(false)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  
  // Form states
  const [subjectType, setSubjectType] = useState('random')
  const [artistStyle, setArtistStyle] = useState('random')
  const [imageType, setImageType] = useState('random')
  const [complexity, setComplexity] = useState([5])
  const [manualSubject, setManualSubject] = useState('')
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')

  // Load available models on component mount
  useEffect(() => {
    fetch('/models')
      .then(res => res.json())
      .then(data => setModels(data))
      .catch(err => console.error('Failed to load models:', err))
    
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const generatePrompt = async () => {
    setLoading(true)
    try {
      const params = {
        subject_type: subjectType,
        artist_style: artistStyle,
        image_type: imageType,
        insanity: complexity[0],
        manual_subject: manualSubject,
        prefix: prefix,
        suffix: suffix
      }

      if (batchMode) {
        // Generate for all models
        const response = await fetch('/generate/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        })
        const data = await response.json()
        setPrompts(data)
      } else {
        // Generate for selected model
        const response = await fetch('/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...params, model_type: selectedModel })
        })
        const data = await response.json()
        setPrompts({ [selectedModel]: data })
      }
    } catch (error) {
      console.error('Error generating prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        try {
          document.execCommand('copy')
        } finally {
          textArea.remove()
        }
      }
      
      // Show success state
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
      
      console.log('Text copied successfully')
    } catch (err) {
      console.error('Failed to copy text:', err)
      // Alternative fallback: show alert with text to copy manually
      alert('Copy failed. Please manually copy the text:\n\n' + text.substring(0, 100) + '...')
    }
  }

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'sdxl':
        return <span className="text-xs font-bold bg-secondary/20 text-primary px-2 py-1 rounded border border-secondary/30">SDXL</span>
      case 'qwen':
        return <span className="text-xs font-bold bg-secondary/20 text-primary px-2 py-1 rounded border border-secondary/30">QWEN</span>
      case 'flux':
        return <span className="text-xs font-bold bg-secondary/20 text-primary px-2 py-1 rounded border border-secondary/30">FLUX</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              AI Prompt Studio
            </h1>
            <p className="text-muted-foreground text-lg">Professional prompt generation for SDXL, Qwen, and Flux models</p>
          </div>
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="icon"
            className="rounded-full border-primary/20 hover:border-secondary"
          >
            {darkMode ? <Sun className="h-5 w-5 text-gold" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <Card className="mb-8 border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-semibold text-primary">Model Selection</CardTitle>
            <CardDescription className="text-muted-foreground">Choose your target AI model or generate for all</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="model">Target Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={batchMode}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(models).map(([key, model]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {getModelIcon(key)}
                          {model.display_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {models[selectedModel] && !batchMode && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {models[selectedModel].description}
                  </p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={batchMode}
                    onChange={(e) => setBatchMode(e.target.checked)}
                    className="rounded"
                  />
                  Generate for all models
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
            <CardTitle className="text-xl font-semibold text-primary">Prompt Configuration</CardTitle>
            <CardDescription className="text-muted-foreground">Fine-tune your prompt generation parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Type</Label>
                <Select value={subjectType} onValueChange={setSubjectType}>
                  <SelectTrigger id="subject">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                    <SelectItem value="animal">Animal</SelectItem>
                    <SelectItem value="humanoid">Humanoid</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="concept">Concept</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artist Style</Label>
                <Select value={artistStyle} onValueChange={setArtistStyle}>
                  <SelectTrigger id="artist">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random Artist</SelectItem>
                    <SelectItem value="none">No Artist</SelectItem>
                    {artists.map(artist => (
                      <SelectItem key={artist} value={artist}>{artist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagetype">Image Type</Label>
                <Select value={imageType} onValueChange={setImageType}>
                  <SelectTrigger id="imagetype">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    {imageTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="complexity">Complexity Level: {complexity[0]}</Label>
              <Slider
                id="complexity"
                min={0}
                max={10}
                step={1}
                value={complexity}
                onValueChange={setComplexity}
                className="w-full"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual">Custom Subject (Optional)</Label>
                <Input
                  id="manual"
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  placeholder="e.g., 'a cyberpunk cat wearing sunglasses'"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefix">Prefix (Optional)</Label>
                <Input
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="Text to add at the beginning"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix (Optional)</Label>
                <Input
                  id="suffix"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="Text to add at the end"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={generatePrompt} 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate {batchMode ? 'All Prompts' : 'Prompt'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {Object.keys(prompts).length > 0 && (
          <Card className="border-primary/10 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
              <CardTitle className="text-xl font-semibold text-primary">Generated Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(prompts).length > 1 ? (
                <Tabs defaultValue={Object.keys(prompts)[0]}>
                  <TabsList className="grid w-full bg-primary/10 p-1 rounded-lg" style={{ gridTemplateColumns: `repeat(${Object.keys(prompts).length}, 1fr)` }}>
                    {Object.entries(prompts).map(([modelKey, _]) => (
                      <TabsTrigger key={modelKey} value={modelKey}>
                        <div className="flex items-center gap-2">
                          {getModelIcon(modelKey)}
                          {models[modelKey]?.display_name || modelKey.toUpperCase()}
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(prompts).map(([modelKey, promptData]) => (
                    <TabsContent key={modelKey} value={modelKey} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Positive Prompt</Label>
                        <div className="relative">
                          <Textarea 
                            value={promptData.prompt} 
                            readOnly 
                            className="min-h-[100px] pr-12 font-mono text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(promptData.prompt || '', `prompt-${modelKey}`) }}
                            className="absolute top-2 right-2 hover:bg-secondary/20 transition-colors"
                          >
                            {copiedStates[`prompt-${modelKey}`] ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {promptData.negative_prompt && (
                        <div className="space-y-2">
                          <Label>Negative Prompt</Label>
                          <div className="relative">
                            <Textarea 
                              value={promptData.negative_prompt} 
                              readOnly 
                              className="min-h-[60px] pr-12 font-mono text-sm"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(promptData.negative_prompt || '', 'single-neg') }}
                              className="absolute top-2 right-2 hover:bg-secondary/20 transition-colors"
                            >
                              {copiedStates['single-neg'] ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      {promptData.settings && (
                        <div className="mt-4 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                          <Label className="text-sm font-semibold text-primary">Recommended Settings</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                            {Object.entries(promptData.settings).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium text-primary">{key}:</span> <span className="text-secondary">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                Object.entries(prompts).map(([modelKey, promptData]) => (
                  <div key={modelKey} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Positive Prompt</Label>
                      <div className="relative">
                        <Textarea 
                          value={promptData.prompt} 
                          readOnly 
                          className="min-h-[100px] pr-12 font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(promptData.prompt, 'single-prompt') }}
                          className="absolute top-2 right-2 hover:bg-secondary/20 transition-colors"
                        >
                          {copiedStates['single-prompt'] ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {promptData.negative_prompt && (
                      <div className="space-y-2">
                        <Label>Negative Prompt</Label>
                        <div className="relative">
                          <Textarea 
                            value={promptData.negative_prompt} 
                            readOnly 
                            className="min-h-[60px] pr-12 font-mono text-sm"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(promptData.negative_prompt || '', `neg-${modelKey}`) }}
                            className="absolute top-2 right-2 hover:bg-secondary/20 transition-colors"
                          >
                            {copiedStates[`neg-${modelKey}`] ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App