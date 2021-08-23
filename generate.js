const tablemark = require('tablemark')
const fs = require('fs')
let output = require('./output.json')
let keys = Object.keys(output)

function ConvertMinutes(num) {
  d = Math.floor(num / 1440) // 60*24
  h = Math.floor((num - d * 1440) / 60)
  m = Math.round(num % 60)

  if (d > 0) {
    return d + 'd<br/>' + h + 'h<br/>' + m + 'm'
  } else {
    return h + 'h<br/>' + m + 'm'
  }
}

let shows = keys.map((key) => {
  let value = output[key]

  let {
    status,
    name: show,
    archived,
    aired_episodes: airedEpisodes,
    seen_episodes: seenEpisodes,
    runtime,
    userData
  } = value

  let { seasons } = userData

  let realAiredEpisodes = seasons.reduce((acc, season) => {
    acc += season.episodes.filter((episode) => episode.aired).length
    return acc
  }, 0)

  let watchTime = value.runtime * value.seen_episodes
  let totalTime = runtime * realAiredEpisodes
  let timeLeft =
    totalTime === watchTime ? '' : ConvertMinutes(totalTime - watchTime)
  let timeWasted = ConvertMinutes(watchTime)
  let percentage = parseFloat(
    ((seenEpisodes / realAiredEpisodes) * 100).toFixed(2)
  )

  return {
    show,
    status,
    percentage,
    timeWasted,
    timeLeft,
    archived,
    airedEpisodes,
    seenEpisodes,
    realAiredEpisodes,
    runtime,
    rawTime: watchTime
  }
})

shows.sort((a, b) => (a.rawTime < b.rawTime ? 1 : -1))

shows = shows.map((obj) => {
  return Object.assign(
    {},
    ...Object.keys(obj).map((key) => {
      if (typeof obj[key] === 'string') {
        // oh odin, help me
        return {
          [key]: obj[key]
            .replace(/\\u(\w{4})/g, (...a) =>
              String.fromCodePoint(parseInt(a[1], 16))
            )
            .normalize()
        }
      }

      return { [key]: obj[key] }
    })
  )
})

fs.writeFileSync(
  'output.md',
  tablemark(shows, {
    stringify: function (v) {
      if (v === true) return '✔'
      if (v === false) return '❌'
      return String(v).trim()
    },
    columns: ['📺', '📢', '⚡', '⏰', '👈', '🗑', '📡', '👁️', '🌑', '⏱', '⭐']
  }),
  {
    encoding: 'utf8'
  }
)

console.log('Success.')
