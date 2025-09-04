import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { Textarea } from './components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Sparkles, Copy, Loader2, Cpu, Palette, Zap } from 'lucide-react'
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
  }, [])

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'sdxl':
        return <Cpu className="h-4 w-4" />
      case 'qwen':
        return <Palette className="h-4 w-4" />
      case 'flux':
        return <Zap className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sparkles className="h-12 w-12" />
            Multi-Model Prompt Generator
          </h1>
          <p className="text-purple-200">Generate optimized prompts for SDXL, Qwen, and Flux AI models</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Model Selection</CardTitle>
            <CardDescription>Choose your target AI model or generate for all</CardDescription>
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prompt Settings</CardTitle>
            <CardDescription>Configure your prompt generation parameters</CardDescription>
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
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {batchMode ? 'All Prompts' : 'Prompt'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {Object.keys(prompts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(prompts).length > 1 ? (
                <Tabs defaultValue={Object.keys(prompts)[0]}>
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Object.keys(prompts).length}, 1fr)` }}>
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
                            onClick={() => copyToClipboard(promptData.prompt || '')}
                            className="absolute top-2 right-2"
                          >
                            <Copy className="h-4 w-4" />
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
                              onClick={() => copyToClipboard(promptData.negative_prompt || '')}
                              className="absolute top-2 right-2"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {promptData.settings && (
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                          <Label className="text-sm font-semibold">Recommended Settings</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            {Object.entries(promptData.settings).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-muted-foreground">{key}:</span> {String(value)}
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
                          onClick={() => copyToClipboard(promptData.prompt)}
                          className="absolute top-2 right-2"
                        >
                          <Copy className="h-4 w-4" />
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
                            onClick={() => copyToClipboard(promptData.negative_prompt || '')}
                            className="absolute top-2 right-2"
                          >
                            <Copy className="h-4 w-4" />
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