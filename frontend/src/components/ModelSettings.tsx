import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { Settings2, Zap, Image } from 'lucide-react'

interface ModelConfig {
  display_name: string
  description: string
  optimal_prompt_style: string
  supports_negative_prompts: boolean
  supports_weights: boolean
  recommended_settings: Record<string, any>
}

interface ModelSettingsProps {
  config: ModelConfig | null
  modelType: string
}

export function ModelSettings({ config, modelType }: ModelSettingsProps) {
  if (!config) return null

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'sdxl':
        return <Settings2 className="h-5 w-5" />
      case 'qwen':
        return <Zap className="h-5 w-5" />
      case 'flux':
        return <Image className="h-5 w-5" />
      default:
        return <Settings2 className="h-5 w-5" />
    }
  }


  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getModelIcon(modelType)}
          Model Configuration - {config.display_name}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Optimal Prompt Style */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Optimal Prompt Style</Label>
          <Badge variant="outline" className="text-sm">
            {config.optimal_prompt_style}
          </Badge>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Features</Label>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={config.supports_negative_prompts ? "default" : "secondary"}
              className={config.supports_negative_prompts ? "bg-green-500" : "bg-gray-400"}
            >
              {config.supports_negative_prompts ? "✓" : "✗"} Negative Prompts
            </Badge>
            <Badge 
              variant={config.supports_weights ? "default" : "secondary"}
              className={config.supports_weights ? "bg-green-500" : "bg-gray-400"}
            >
              {config.supports_weights ? "✓" : "✗"} Weight Syntax
            </Badge>
          </div>
        </div>

        {/* Recommended Settings */}
        {Object.keys(config.recommended_settings).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recommended Settings</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(config.recommended_settings).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs font-medium text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </div>
                  <div className="text-sm font-semibold">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model-Specific Tips */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Optimization Tips</Label>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
            {modelType === 'sdxl' && (
              <ul className="space-y-1">
                <li>• Use detailed, structured descriptions with quality tags</li>
                <li>• Include technical photography/art terminology</li>
                <li>• Leverage weight syntax for emphasis: (keyword:1.2)</li>
                <li>• Add camera settings for photorealistic content</li>
              </ul>
            )}
            {modelType === 'qwen' && (
              <ul className="space-y-1">
                <li>• Use natural, conversational language</li>
                <li>• Describe scenes and narratives</li>
                <li>• Avoid overly technical terminology</li>
                <li>• Focus on storytelling elements</li>
              </ul>
            )}
            {modelType === 'flux' && (
              <ul className="space-y-1">
                <li>• Emphasize artistic movements and styles</li>
                <li>• Use mood and atmosphere descriptors</li>
                <li>• Include creative and abstract concepts</li>
                <li>• Focus on emotional and aesthetic qualities</li>
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}