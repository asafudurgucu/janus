import type { JanusApi } from './index'

declare global {
  interface Window {
    janus: JanusApi
  }
}

export {}
