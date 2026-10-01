import { Lighthouse as AppLighthouse } from '../components/ui'

// The island is scenery; the beacon itself is the same SVG as the app's brand.
export default function Lighthouse({ sparks }: { sparks: number }) {
  return <div className={`ml-scene ml-light-${sparks}`} data-testid="lighthouse" data-sparks={sparks} aria-hidden="true">
    <svg className="ml-island-scene" viewBox="0 0 620 470">
      <ellipse className="ml-scene-halo" cx="310" cy="195" rx="192" ry="184" fill="var(--purple-bg)" />
      <path d="M18 287q112-18 223 0t231 0 130 0v183H18Z" fill="var(--blue-bg)" />
      <g className="ml-horizon-lights"><g transform="translate(77 248)"><path d="M-7 0H7l3 22H-10Z" fill="var(--tone-9b8be8)" /><path d="M-9 0 0-7 9 0Z" fill="var(--tone-8865df)" /><circle cx="0" cy="5" r="3" fill="#ffe6a7" /></g><g transform="translate(534 263)"><path d="M-6 0H6l3 18H-9Z" fill="var(--tone-9b8be8)" /><path d="M-8 0 0-6 8 0Z" fill="var(--tone-8865df)" /><circle cx="0" cy="4" r="2.5" fill="#ffe6a7" /></g></g>
      <g className="ml-water-rings" fill="none" stroke="var(--tone-cfc6f5)"><ellipse cx="313" cy="362" rx="228" ry="57" /><ellipse cx="313" cy="362" rx="267" ry="80" opacity=".5" /></g>
      <path d="m148 348 69-42 90-23 101 26 67 41-56 41-130 15-103-26Z" fill="var(--tone-cfc6f5)" />
      <path d="m148 348 38 32 103 26 130-15 56-41-18 42-102 42-136-18-54-32Z" fill="var(--tone-9b8be8)" opacity=".65" />
      <path d="m148 348 69-42 90-23 101 26 67 41-91 22-103 9-85-20Z" fill="var(--mint-bg)" />
      <path d="M296 336c-20 14 7 24 7 33s-30 15-31 34" fill="none" stroke="var(--tone-cfc6f5)" strokeWidth="9" strokeLinecap="round" />
      <g fill="var(--tone-66a586)"><path d="m209 331 12-26 12 26h-8v18h-8v-18ZM396 333l11-24 11 24h-7v14h-8v-14Z" /></g>
      <g className="ml-foreground-water" stroke="var(--tone-508ad5)" strokeWidth="2" opacity=".25" fill="none" strokeLinecap="round"><path d="M46 359h42m424 10h51M106 412h70m225 18h66M246 451h82" /></g>
    </svg>
    <AppLighthouse sparks={sparks} className="ml-main-beacon" />
    <div className="ml-screen-beam" />
  </div>
}
