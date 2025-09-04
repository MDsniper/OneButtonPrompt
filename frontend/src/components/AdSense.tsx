import { useEffect } from 'react'

interface AdSenseProps {
  client: string
  slot: string
  style?: React.CSSProperties
  format?: string
  responsive?: boolean
}

export default function AdSense({ 
  client, 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  responsive = true 
}: AdSenseProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  )
}