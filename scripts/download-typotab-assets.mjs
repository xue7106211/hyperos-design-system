#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import path from 'node:path';

const ROOT = path.resolve('public/typotab');
const assets = [
  // Hero
  ['images/hero-demo.png', 'https://framerusercontent.com/images/cPobxzpL1dK0OKf5zooeFuDG9kM.png?width=3839&height=2160'],
  ['images/clouds-decor.png', 'https://framerusercontent.com/images/l6hCKFjqTWSjPTjguaQiWeZKwI.png?width=3072&height=2304'],
  ['images/badge-shape.png', 'https://framerusercontent.com/images/lBu8ApMRnib5ShH8EWURasi8jQ.png?width=78&height=123'],
  ['images/logo-wordmark.png', 'https://framerusercontent.com/images/xmY9rJkpcbbTaoMF7XYHg9kLwOU.png'],
  // Value prop
  ['images/menu-hotkeys.png', 'https://framerusercontent.com/images/sBmJPvMStHI85ywqGqiCpnZ0.png?width=2022&height=1500'],
  ['images/settings-card.png', 'https://framerusercontent.com/images/4u5Fjpz1VW4UOcL6Hvi6CXKygYQ.png?width=2022&height=1500'],
  ['images/menubar-menu.png', 'https://framerusercontent.com/images/NbASoBQ82waDgczO9oOMtIpsM.png?width=3858&height=2160'],
  ['images/works-everywhere-bg.jpg', 'https://framerusercontent.com/images/bfiQolqL5A4njD3kypPuNFqr8Y.jpg?scale-down-to=4096'],
  // Shortcuts
  ['images/mac-keyboard.png', 'https://framerusercontent.com/images/cYdLGhprakxRPMKlPPTEsuBwrM.png?width=1556&height=670'],
  // Use case posters
  ['images/usecase-studies-poster.png', 'https://framerusercontent.com/images/lHCom2IJeNAy3YjWpgAowaXp4L4.png?width=1976&height=1974'],
  ['images/usecase-ideas-poster.png', 'https://framerusercontent.com/images/oKHSEqbLnxe5TXGw3Gi7pcJ2g.png?width=1976&height=1974'],
  ['images/usecase-proposal-poster.png', 'https://framerusercontent.com/images/nePEK9QMtSSgTSHY2kuIj2OGvBg.png?width=1976&height=1974'],
  // Videos
  ['videos/usecase-studies.mp4', 'https://www.dropbox.com/scl/fi/llk0raojivdckooew62ij/MkG7wDiD9mO9yCTDDhr0xzFFijE.mp4?rlkey=63zrmsok5cd8kgb2s8d6a4q4z&raw=1'],
  ['videos/usecase-ideas.mp4', 'https://www.dropbox.com/scl/fi/bcvawim5rhmzc4ij9974d/wOJJ8PwDUJLKENOuC324NiV6bLw.mp4?rlkey=3wexv2at4y2ye4yr58smfead9&raw=1'],
  ['videos/usecase-proposal.mp4', 'https://www.dropbox.com/scl/fi/ewoso3tjzjid8wut22wyi/VUB2Lv3hgL9NEerDYYjOKd9VMk.mp4?rlkey=cvhonaak06g0xuvasrs9stn4y&raw=1'],
  // App logos (unique)
  ['logos/google-docs.png', 'https://framerusercontent.com/images/bOeviN7tCfvu2V3VMvkiPXpRiw.png?width=256&height=256'],
  ['logos/word.png', 'https://framerusercontent.com/images/wmBeqqOpTTqRxk5Iu5bY9NGEHY.png?width=256&height=256'],
  ['logos/gmail.png', 'https://framerusercontent.com/images/Hpa87HBexXAkBjBdaC1MehAU.png?width=256&height=256'],
  ['logos/slack.png', 'https://framerusercontent.com/images/4oZEP5qbWmijk4FsRcf9DJuLkyE.png?width=256&height=256'],
  ['logos/outlook.png', 'https://framerusercontent.com/images/74yVH5mI7Q3pAcD5o22h3f0lG2Y.png?width=256&height=256'],
  ['logos/whatsapp.png', 'https://framerusercontent.com/images/Aiwg1aoOFgKcgBRy4r36GrHn64s.png?width=256&height=256'],
  ['logos/notion.png', 'https://framerusercontent.com/images/17Hk2O1HxfNlWDplL5l6lt6GT8.png?width=256&height=256'],
  ['logos/mail.png', 'https://framerusercontent.com/images/9EZw0mwHh9WUK1ApbeDvYxvus.png?width=256&height=256'],
  ['logos/discord.png', 'https://framerusercontent.com/images/kV6fvD9hL5vRApmZzmRK13td8.png?width=256&height=256'],
  ['logos/teams.png', 'https://framerusercontent.com/images/34KWq8usaRRHxZIYZZkSwQPePQ.png?width=256&height=256'],
  ['logos/chrome.png', 'https://framerusercontent.com/images/2luq8cr5TjUFISJRQfItlcl6pE.png?width=256&height=256'],
  ['logos/safari.png', 'https://framerusercontent.com/images/C8dnnUS9xl3g7L6rmAyE008oT4.png?width=256&height=256'],
  ['logos/linkedin.png', 'https://framerusercontent.com/images/PjlqPyjsoDk6I8M0UrL12FqHioE.png?width=256&height=256'],
  ['logos/x.png', 'https://framerusercontent.com/images/Qz6g60asFFM1y9n1CS8CtDVVZk0.png?width=256&height=256'],
  ['logos/facebook.png', 'https://framerusercontent.com/images/0Hz9TR0UHjD0crobw3JnrkiFKw.png?width=256&height=256'],
  ['logos/vscode.png', 'https://framerusercontent.com/images/9x5NIHoY4LiU4xNQSlUTV04xcc.png?width=256&height=256'],
  ['logos/reddit.png', 'https://framerusercontent.com/images/A9m7Lv0epIOSngcbBu5Sa52W7U.png?width=256&height=256'],
  ['logos/zoom.png', 'https://framerusercontent.com/images/yLZEfV6NYDwF1JudT3INg5sWXs.png?width=256&height=256'],
  ['logos/google-chat.png', 'https://framerusercontent.com/images/ciiO0Q9wPq5BI9pUlNpug3sift4.png?width=256&height=256'],
  ['logos/trello.png', 'https://framerusercontent.com/images/mmHFclH5r96Tm67oclurM8OA.png?width=256&height=256'],
  ['logos/asana.png', 'https://framerusercontent.com/images/z1hkgwLPwTCX60PShwsjCnCd3v0.png?width=256&height=256'],
  ['logos/linear.png', 'https://framerusercontent.com/images/QNhVJbA0u7GOKrkvyCLDg4SLdE4.png?width=256&height=256'],
  ['logos/intercom.png', 'https://framerusercontent.com/images/IBedj07LlBysWrFooe1UkNGK21A.png?width=256&height=256'],
  ['logos/telegram.png', 'https://framerusercontent.com/images/YvWuW3970F44bruSN87YpSqRQ.png?width=256&height=256'],
  ['logos/finder.png', 'https://framerusercontent.com/images/2HvSuX7uCYBwdeEUPchOMgqR1ac.png'],
  ['logos/instagram.png', 'https://framerusercontent.com/images/PHLKjekq3wcpNJNQRyGa7qog.png'],
];

async function download(rel, url) {
  const dest = path.join(ROOT, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return rel;
}

const concurrency = 4;
let i = 0;
const results = [];
async function worker() {
  while (i < assets.length) {
    const idx = i++;
    const [rel, url] = assets[idx];
    try {
      await download(rel, url);
      results.push({ ok: true, rel });
      console.log('ok', rel);
    } catch (e) {
      results.push({ ok: false, rel, error: String(e) });
      console.error('fail', rel, e.message);
    }
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));
await writeFile(path.join(ROOT, 'manifest.json'), JSON.stringify(results, null, 2));
console.log(`done ${results.filter(r=>r.ok).length}/${results.length}`);
