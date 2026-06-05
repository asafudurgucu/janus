/// <reference types="vite/client" />

declare module '@novnc/novnc' {
  interface RFBOptions {
    credentials?: { password?: string; username?: string; target?: string }
    shared?: boolean
    repeaterID?: string
    wsProtocols?: string[]
  }
  export default class RFB extends EventTarget {
    constructor(target: HTMLElement, url: string, options?: RFBOptions)
    scaleViewport: boolean
    clipViewport: boolean
    resizeSession: boolean
    background: string
    viewOnly: boolean
    focusOnClick: boolean
    disconnect(): void
    sendCtrlAltDel(): void
    focus(): void
  }
}
