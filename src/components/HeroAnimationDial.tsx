import { useEffect } from 'react'
import { DialRoot, useDialKit } from 'dialkit'
import 'dialkit/styles.css'

type HeroEasingPreset = 'linear' | 'gentle' | 'smooth' | 'snappy'

type HeroDialConfig = {
  blur: number
  duration: number
  delay: number
  yOffset: number
  easing: HeroEasingPreset
}

export default function HeroAnimationDial() {
  if (!import.meta.env.DEV) {
    return null
  }

  const params = useDialKit('Hero Animation', {
    blur: [18, 0, 80],
    duration: [1.2, 0.2, 3],
    delay: [0.12, 0, 1.5],
    yOffset: [28, 0, 120],
    easing: {
      type: 'select',
      options: [
        { value: 'gentle', label: 'Gentle' },
        { value: 'smooth', label: 'Smooth' },
        { value: 'snappy', label: 'Snappy' },
        { value: 'linear', label: 'Linear' },
      ],
      default: 'gentle',
    },
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const config: HeroDialConfig = {
      blur: params.blur,
      duration: params.duration,
      delay: params.delay,
      yOffset: params.yOffset,
      easing: params.easing as HeroDialConfig['easing'],
    }

    ;(window as Window & { __heroAnimationConfig?: HeroDialConfig }).__heroAnimationConfig =
      config
    window.dispatchEvent(new Event('hero-animation-config-change'))
  }, [params.blur, params.duration, params.delay, params.yOffset, params.easing])

  return <DialRoot position='top-right' />
}
