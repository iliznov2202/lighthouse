import fs from 'node:fs'
fs.mkdirSync('src/design/stickers', { recursive: true })
const packs = [
  ['friends', '#d8f4ed', '<path d="m38 103-12-8m98 8 12-8"/><path d="M57 62q8 9 15 0m16 0q8 9 15 0"/><path d="M72 83q8 9 16 0"/>', '<path d="M119 34c-9-14-29-1-15 11l15 11 15-11c14-12-6-25-15-11" fill="#ff91b1"/>'],
  ['goal', '#fff0cd', '<path d="M58 64h12m22 0h12"/><path d="M71 83q9 10 18 0"/>', '<path d="m124 22 5 11 12 2-9 8 2 12-10-6-11 6 2-12-9-8 13-2Z" fill="#ffd15c"/><path d="m23 35 4 8m-11 1 8 3m107 65 7 5" stroke="#f8b648"/>'],
  ['note', '#e4e4ff', '<path d="M58 65h12m22 0h12"/><path d="M72 84h16"/>', '<rect x="111" y="88" width="32" height="39" rx="5" fill="#ffdc7b" transform="rotate(12 127 108)"/><path d="m119 100 15 3m-17 5 14 3" stroke="#9c7542"/>'],
  ['morning', '#ffe7d8', '<path d="M58 64q6-8 12 0m22 0q6-8 12 0"/><path d="M72 82q8 9 16 0"/>', '<circle cx="126" cy="30" r="13" fill="#ffd15c"/><path d="M126 8v-3m22 25h4m-42-17-4-4m36 5 4-4" stroke="#e8a037"/>'],
  ['love', '#ffe2ed', '<path d="M61 65c-8-10-18 0 0 12 18-12 8-22 0-12m38 0c-8-10-18 0 0 12 18-12 8-22 0-12" fill="#ef7197" stroke="none"/><path d="M72 86q8 7 16 0"/>', '<path d="M126 26c-9-13-25 0 0 18 25-18 9-31 0-18" fill="#f48bae"/>'],
  ['learning', '#deefff', '<path d="M58 63h12m22 0h12"/><path d="M73 81h14"/><rect x="50" y="54" width="25" height="21" rx="7" fill="none"/><rect x="85" y="54" width="25" height="21" rx="7" fill="none"/><path d="M75 62h10"/>', '<path d="M39 103q19-9 41 2 22-11 41-2v25q-21-7-41 2-22-9-41-2Z" fill="#fff"/><path d="M80 105v25"/>'],
  ['plane', '#e0f5fa', '<path d="M58 63q6-8 12 0m22 0q6-8 12 0"/><path d="M71 80q9 12 18 0"/>', '<path d="m110 24 37-12-10 35-10-13-17-10Z" fill="#7bd6ea"/><path d="m127 34 20-22m-35 42-8 9" stroke="#598bb6"/>'],
  ['knitting', '#e8e5ff', '<path d="M58 64h12m22 0h12"/><path d="M73 81q7 6 14 0"/>', '<path d="M108 96h28v21q-14 13-28 0Z" fill="#ffba92"/><path d="M136 101q17-2 12 11-3 5-12 4M117 83q-5-5 1-10m11 10q-5-5 1-10"/>'],
]
const calm = '<path d="M58 64h12m22 0h12M72 83q8 9 16 0"/>'
const extras = [
 ['bestFriends', '#ffe2ed', '<path d="M128 30c-9-12-26 1 0 20 26-19 9-32 0-20" fill="#f48bae"/><path d="m22 47 5 5m-8 4 8 1" stroke="#ee9eae"/>'],
 ['analysis', '#deefff', '<rect x="108" y="89" width="34" height="35" rx="5" fill="white"/><path d="m115 115 6-11 7 4 7-12" stroke="#7e6de4"/>'],
 ['devil', '#eee4ff', '<path d="m48 49-6-25 20 14m47 11 7-25-21 14" fill="#f594b1"/><path d="m126 98 10 7-8 14" stroke="#a171e2"/>'],
 ['geography', '#ddf4ee', '<circle cx="128" cy="105" r="19" fill="#82d6e6"/><path d="m121 89-4 9 8 7-4 10 9 8 8-10-8-6 7-8" fill="#94dba8" stroke="none"/>'],
 ['map', '#fff0cd', '<path d="m106 91 12-5 12 5 13-5v34l-13 5-12-5-12 5Z" fill="#fff"/><path d="M118 86v34m12-29v34" stroke="#bdacd7"/>'],
 ['maths', '#e4e4ff', '<rect x="109" y="86" width="34" height="44" rx="6" fill="#fff"/><path d="M116 96h20m-20 11h6m-3-3v6m11-3h6m-20 13h20" stroke="#7e6de4"/>'],
 ['medal', '#fff0cd', '<path d="m110 83 9 25h14l9-25" fill="#a79aee" stroke="none"/><circle cx="126" cy="115" r="17" fill="#ffce70"/><path d="m126 104 3 7 7 1-5 4 1 7-6-3-6 3 1-7-5-4 7-1Z" fill="#fff" stroke="none"/>'],
 ['news', '#deefff', '<rect x="104" y="90" width="40" height="36" rx="4" fill="#fff"/><path d="M112 99h24m-24 9h9m7 0h8m-24 9h24" stroke="#7c80a0"/>'],
 ['presentation', '#ffe7d8', '<rect x="104" y="87" width="40" height="29" rx="4" fill="#fff"/><path d="M125 116v12m-8 0h16m-20-20 7-10 6 5 8-9" stroke="#8472d9"/>'],
 ['protest', '#ffe2ed', '<path d="M125 78v49" stroke="#9e80aa"/><rect x="105" y="78" width="40" height="27" rx="5" fill="#ffe0a0"/><path d="M125 85v8m0 5v1" stroke="#70507e"/>'],
 ['sport', '#d8f4ed', '<path d="M105 108h41" stroke="#7a70bf"/><path d="M109 100v16m5-21v26m23-26v26m5-21v16" stroke="#a797ee" stroke-width="6"/>'],
 ['school', '#deefff', '<path d="m104 99 22-17 22 17Z" fill="#ffce70"/><rect x="108" y="99" width="36" height="27" rx="3" fill="#fff"/><path d="M121 126v-16h11v16m-19-20h2m22 0h2" stroke="#8e7cce"/>'],
 ['scientist', '#e4e4ff', '<path d="M117 85h17m-13 0v13l-13 23q-2 5 5 5h24q7 0 5-5l-13-23V85" fill="#fff"/><path d="M115 115h22l5 9h-34Z" fill="#80dcca" stroke="none"/><circle cx="126" cy="109" r="3" fill="#a09ee6" stroke="none"/>'],
 ['umbrella', '#ffe7d8', '<path d="M125 84v38q0 12 9 5" stroke="#8c7ad2"/><path d="M102 103q3-27 23-27t23 27q-8-6-15 0-8-6-16 0-7-6-15 0Z" fill="#f7a7c2"/>'],
]
for (const [name, bg, extra] of extras) packs.push([name, bg, calm, extra])
for (const [name, bg, face, extra] of packs) {
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="tower" x2=".7" y2="1"><stop stop-color="#8677ff"/><stop offset="1" stop-color="#6256d5"/></linearGradient></defs><path d="M18 52C6 20 54 5 83 15c40-15 76 13 61 52 18 37-3 80-50 76-40 18-89-11-76-49-8-14-10-29 0-42" fill="white" stroke="white" stroke-width="9"/><circle cx="80" cy="80" r="66" fill="${bg}"/><g fill="none" stroke="#343254" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m79 26 29 24H51Z" fill="#ffce70"/><path d="M49 47h62v18l12 57H37l12-57Z" fill="url(#tower)" stroke="white" stroke-width="4"/><path d="M48 121q32-14 64 0" fill="none" stroke="#a89aff"/><path d="M39 101q-10-15-11-4m93 4q10-15 11-4" fill="none"/>${face}<ellipse cx="49" cy="77" rx="7" ry="4" fill="#ffb0c9" stroke="none"/><ellipse cx="111" cy="77" rx="7" ry="4" fill="#ffb0c9" stroke="none"/>${extra}</g><path d="M25 131q20-9 40 1t42 0 29-1" fill="none" stroke="#5fc9de" stroke-width="7" stroke-linecap="round"/></svg>`
 fs.writeFileSync(`src/design/stickers/${name}.svg`, svg)
}
let catalog = fs.readFileSync('src/design/stickers.ts', 'utf8')
for (const [name] of packs) catalog = catalog.replace(new RegExp(`import ${name} from '[^']+'`), `import ${name} from './stickers/${name}.svg'`)
fs.writeFileSync('src/design/stickers.ts', catalog)
