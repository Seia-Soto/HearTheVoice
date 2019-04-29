const cheerio = require('cheerio')
const express = require('express')
const fs = require('fs')
const request = require('request')
const path = require('path')

const app = express()

const baseuri = 'https://www1.president.go.kr/petitions/'
const trackpt = '579682'

const prepare_file = (filepath, defaults) => {
  let file = null

  if (fs.existsSync(filepath, defaults)) {
    file = JSON.parse(fs.readFileSync(filepath))
  } else {
    fs.writeFileSync(filepath, JSON.stringify(defaults), 'utf8')

    file = defaults
  }
  return file
}
const fetch = () => {
  try {
    request(baseuri + trackpt, (error, response, body) => {
      const $ = cheerio.load(body)
      const timestamp = new Date()

      const counter = ($('span.counter').text() || '').replace(/[^0-9]/gi, '')
      const title = $('h3.petitionsView_title').text()

      if (!counter || !title) {
        console.log(`Failed to fetch at ${Date.now()}, retrying...`)

        fetch()
      }

      let oldstack = prepare_file(`stacks/${trackpt}.json`, {})

      if (!oldstack[timestamp.getDate()]) oldstack[timestamp.getDate()] = {}
      if (!oldstack[timestamp.getDate()][timestamp.getHours()]) oldstack[timestamp.getDate()][timestamp.getHours()] = {}

      oldstack[timestamp.getDate()][timestamp.getHours()][timestamp.getMinutes()] = counter
      oldstack.title = title

      fs.writeFileSync(`stacks/${trackpt}.json`, JSON.stringify(oldstack), 'utf8')
    })
  } catch (error) {
    console.log(`Failed to fetch at ${Date.now()}, retrying...`)

    fetch()
  }
}

app.use(express.static(path.join(__dirname, 'statics')))
app.use('/stacks', express.static(path.join(__dirname, 'stacks')))

app.enable('trust proxy')

// NOTE: Pass all incompleted requests into root.
app.use((req, res) => res.redirect('/'))

app.listen(3003, () => console.log('Application is listening...'))

fetch()
setInterval(fetch, 1000 * 15)
