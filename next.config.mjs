/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us.posthog.com https://us-assets.i.posthog.com https://va.vercel-scripts.com https://cdn.jsdelivr.net https://d3js.org https://unpkg.com https://platform.twitter.com https://cdnjs.cloudflare.com https://code.jquery.com https://stackpath.bootstrapcdn.com https://cdn.plot.ly https://cdn.socket.io https://cdn.datatables.net https://cdn.rawgit.com https://cdn.jsdelivr.net/npm https://unpkg.com/three https://cdn.skypack.dev https://platform.twitter.com; connect-src 'self' https://us.posthog.com https://us.i.posthog.com https://vitals.vercel-insights.com https://uselessfacts.jsph.pl https://api.countapi.xyz https://ipapi.co https://api.github.com https://api.open-meteo.com https://randomuser.me https://dog.ceo https://catfact.ninja https://api.chucknorris.io https://api.adviceslip.com https://official-joke-api.appspot.com https://api.quotable.io https://jsonplaceholder.typicode.com https://api.thecatapi.com https://api.thedogapi.com https://restcountries.com https://geo.ipify.org https://api.ipify.org; img-src 'self' blob: data: https://us-assets.i.posthog.com https://github.com https://avatars.githubusercontent.com https://*.tile.openstreetmap.org https://images.unsplash.com https://media.giphy.com https://i.imgur.com https://placekitten.com https://picsum.photos https://*.githubusercontent.com https://cdn-icons-png.flaticon.com https://img.icons8.com https://cdn.pixabay.com https://images.pexels.com https://dog.ceo; style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://open.spotify.com https://www.loom.com https://clips.twitch.tv https://codepen.io https://gist.github.com https://www.google.com https://platform.twitter.com https://codesandbox.io https://stackblitz.com https://replit.com https://w.soundcloud.com https://www.figma.com https://calendar.google.com https://docs.google.com https://www.google.com/maps/; media-src 'self' https://www.soundhelix.com https://www.w3.org; object-src 'self'; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;
