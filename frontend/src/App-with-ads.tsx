import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Slider } from './components/ui/slider'
import { Textarea } from './components/ui/textarea'
import { Sparkles, Copy, Loader2 } from 'lucide-react'
import AdSense from './components/AdSense'
import './globals.css'

// Replace these with your actual AdSense values
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'
const ADSENSE_SLOT_HEADER = 'XXXXXXXXXX'
const ADSENSE_SLOT_SIDEBAR = 'XXXXXXXXXX'
const ADSENSE_SLOT_FOOTER = 'XXXXXXXXXX'

// Artist and image type arrays from the backend
const artists = [
  "Greg Rutkowski", "Artgerm", "Alphonse Mucha", "Studio Ghibli", "James Gurney", "Frank Frazetta",
  "Beeple", "Peter Mohrbacher", "Ross Tran", "Makoto Shinkai", "Ilya Kuvshinov", "Lois van Baarle",
  "Sam Spratt", "Yoji Shinkawa", "Hayao Miyazaki", "Norman Rockwell", "Steve McCurry", "Banksy",
  "H.R. Giger", "Zdzisław Beksiński", "Wayne Barlowe", "Michael Whelan", "Bob Ross", "Thomas Kinkade",
  "Syd Mead", "Simon Stålenhag", "Katsuhiro Otomo", "Moebius", "Ralph McQuarrie", "Drew Struzan",
  "Boris Vallejo", "Julie Bell", "Luis Royo", "Victoria Francés", "Anne Stokes", "Nene Thomas",
  "Josephine Wall", "Thomas Cole", "Albert Bierstadt", "Caspar David Friedrich", "Ivan Aivazovsky",
  "William Turner", "Claude Monet", "Vincent van Gogh", "Pablo Picasso", "Salvador Dalí",
  "René Magritte", "M.C. Escher", "Remedios Varo", "Frida Kahlo", "Gustav Klimt", "Egon Schiele",
  "Yoshitaka Amano", "Akira Toriyama", "Kentaro Miura", "Junji Ito", "Kim Jung Gi", "Ashley Wood",
  "Craig Mullins", "Sparth", "Feng Zhu", "Jama Jurabaev", "Dylan Cole", "Maciej Kuciara"
]

const imageTypes = [
  "digital painting", "oil painting", "watercolor", "3D render", "photograph", "concept art",
  "matte painting", "splash art", "cover art", "hyperrealistic", "photorealistic", "surrealism",
  "impressionism", "expressionism", "abstract art", "pop art", "art nouveau", "art deco",
  "baroque", "renaissance", "gothic art", "romanticism", "neoclassical", "minimalist art",
  "maximalist art", "psychedelic art", "vaporwave", "cyberpunk art", "steampunk art", "dieselpunk art",
  "biopunk art", "solarpunk art", "fantasy art", "sci-fi art", "horror art", "dark fantasy",
  "high fantasy", "low poly", "pixel art", "vector art", "line art", "ink drawing", "charcoal drawing",
  "pencil sketch", "colored pencil", "pastel art", "acrylic painting", "gouache painting", "tempera",
  "fresco", "encaustic", "airbrush art", "spray paint", "street art", "graffiti", "stencil art",
  "woodcut", "linocut", "etching", "lithograph", "screen print", "risograph", "cyanotype",
  "polaroid", "film photography", "digital photography", "drone photography", "macro photography",
  "portrait photography", "landscape photography", "architectural photography", "fashion photography"
]

function App() {
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  
  // Form states
  const [subjectType, setSubjectType] = useState('random')
  const [artistStyle, setArtistStyle] = useState('random')
  const [imageType, setImageType] = useState('random')
  const [complexity, setComplexity] = useState([5])
  const [manualSubject, setManualSubject] = useState('')
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')

  const generatePrompt = async () => {
    setLoading(true)
    try {
      // Use environment variable for API URL in production
      const apiUrl = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com'
      
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_type: subjectType,
          artist_style: artistStyle,
          image_type: imageType,
          insanity: complexity[0],
          manual_subject: manualSubject,
          prefix: prefix,
          suffix: suffix
        })
      })
      const data = await response.json()
      setPrompt(data.prompt)
      setNegativePrompt('low quality, blurry, pixelated, noisy, oversaturated, undersaturated, bad anatomy, wrong proportions')
    } catch (error) {
      console.error('Error generating prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Header Ad */}
      <div className="w-full bg-white/10 backdrop-blur-sm p-2">
        <div className="max-w-6xl mx-auto">
          <AdSense 
            client={ADSENSE_CLIENT}
            slot={ADSENSE_SLOT_HEADER}
            style={{ display: 'block', textAlign: 'center' }}
            format="horizontal"
          />
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Sparkles className="h-12 w-12" />
              One Button Prompt Generator
            </h1>
            <p className="text-purple-200">Create amazing AI art prompts with a modern interface</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
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
                        Generate Prompt
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {prompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Prompts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Positive Prompt</Label>
                      <div className="relative">
                        <Textarea 
                          value={prompt} 
                          readOnly 
                          className="min-h-[100px] pr-12 font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(prompt)}
                          className="absolute top-2 right-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Negative Prompt</Label>
                      <div className="relative">
                        <Textarea 
                          value={negativePrompt} 
                          readOnly 
                          className="min-h-[60px] pr-12 font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard(negativePrompt)}
                          className="absolute top-2 right-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Ad */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-4">
                  <AdSense 
                    client={ADSENSE_CLIENT}
                    slot={ADSENSE_SLOT_SIDEBAR}
                    style={{ display: 'block' }}
                    format="vertical"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Ad */}
      <div className="w-full bg-white/10 backdrop-blur-sm p-4 mt-8">
        <div className="max-w-6xl mx-auto">
          <AdSense 
            client={ADSENSE_CLIENT}
            slot={ADSENSE_SLOT_FOOTER}
            style={{ display: 'block', textAlign: 'center' }}
            format="horizontal"
          />
        </div>
      </div>
    </div>
  )
}

export default App