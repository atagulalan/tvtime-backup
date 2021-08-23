require('dotenv').config()
let tvtime = require('tvtime-api')
var fs = require('fs')

let allShows = {}

function forEachWithCallback(callback, resolve) {
  const arrayCopy = this
  let index = 0
  const next = () => {
    index++
    if (arrayCopy.length > 0) {
      callback(arrayCopy.shift(), index, next)
    } else {
      resolve(index)
    }
  }
  next()
}

Array.prototype.forEachWithCallback = forEachWithCallback

tvtime
  .login(process.env.TVTIME_USERNAME, process.env.TVTIME_PASSWORD)
  .then((loginStatus) => {
    console.log(loginStatus)
    tvtime.shows().then((data) => {
      data.forEachWithCallback(
        (allData, i, next) => {
          let { id, name, img } = allData
          tvtime.show(id).then((userData) => {
            console.log(`(${id}) ${name}: SUCCESS`)
            allShows[id] = { ...allData, userData }
            next()
          })
        },
        () => {
          fs.writeFileSync('output.json', JSON.stringify(allShows), {
            encoding: 'utf8'
          })
        }
      )
    })
  })
  .catch(console.error)
