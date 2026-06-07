const fs = require('fs');
const path = require('path');

const stickers = {
  business: {
    'star.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    'target.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="2"/></svg>',
    'gem.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 9l3 11h14l3-11-10-7z"/></svg>'
  },
  nature: {
    'leaf.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-6 4-6 10 0 3.31 2.69 6 6 6s6-2.69 6-6c0-6-6-10-6-10z"/></svg>',
    'sun.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.536-7.536l-1.414 1.414M7.879 17.536l-1.414 1.414M17.536 17.536l-1.414-1.414M7.879 7.879L6.464 6.464" stroke="currentColor" stroke-width="2"/></svg>',
    'moon.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>'
  },
  fun: {
    'heart.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    'crown.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>',
    'music.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3v-7h6v2h-4v8c0 1.66-1.34 3-3 3z"/></svg>'
  },
  shapes: {
    'square.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18"/></svg>',
    'circle.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    'diamond.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>'
  }
};

const baseDir = path.join(process.cwd(), 'public', 'stickers');

for (const [pack, svgs] of Object.entries(stickers)) {
  const dir = path.join(baseDir, pack);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(svgs)) {
    fs.writeFileSync(path.join(dir, name), content, 'utf8');
  }
}
console.log("Stickers generated.");
