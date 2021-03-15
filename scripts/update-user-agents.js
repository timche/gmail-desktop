const path = require('path')
const got = require('got')
const writeJsonFile = require('write-json-file')

async function main() {
  let latestFirefoxUserAgents

  try {
    const { body } = await got(
      'https://www.whatismybrowser.com/guides/the-latest-user-agent/firefox'
    )
    latestFirefoxUserAgents = body
  } catch {}

  if (!latestFirefoxUserAgents) {
    return
  }

  const match = latestFirefoxUserAgents.match(
    /Mozilla\/\d+.\d+ \(.+\) Gecko\/\d+ Firefox\/\d+.\d+/gm
  )

  if (!match) {
    return
  }

  await writeJsonFile(
    path.resolve(__dirname, '..', 'src', 'user-agents.json'),
    {
      windows: match[0],
      macos: match[1],
      linux: match[5]
    }
  )

  console.log('Updated User Agents')
}

main()
