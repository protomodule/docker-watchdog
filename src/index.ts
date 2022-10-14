import monitor from "node-docker-monitor"
import { WebClient } from "@slack/web-api"

const slack = new WebClient(process.env.SLACK_TOKEN)
const slackChannel = process.env.SLACK_CHANNEL || ""
const environment = process.env.ENVIRONMENT
const application = process.env.APPLICATION
var enabled = false

const delay = <T>(ms: number, result?: T) => new Promise(resolve => setTimeout(() => resolve(result), ms))

const notify = async (channel: string, icon_emoji: string, text: string, message: string, image: string, uptime?: string, icon: string = "https://raw.githubusercontent.com/protomodule/docker-watchdog/main/resources/up.png") => {
  try {  
    const result = await slack.chat.postMessage({
      text,
      icon_emoji,
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `${application ? `_${application}_: ` : ""} ${message}`.trim()
          }
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "image",
              "image_url": icon,
              "alt_text": "Docker"
            },
            {
              "type": "mrkdwn",
              "text": `Image *${image}*`
            },
            (environment ? {
              "type": "mrkdwn",
              "text": `Environment *${environment}*`
            } : null),
            (uptime ? {
              "type": "mrkdwn",
              "text": `Uptime *${uptime}*`
            } : null),
          ].filter(element => !!element)
        }
      ],
      channel
    })
    console.log(`📤  Sent message ${result.ts} (${result.message.text}) to channel ${result.channel}`)
  }
  catch (error) {
    console.error(`💥  ERROR: ${error.message}`)
  }
}

const up = async (name: string, image: string) => {
  return notify(slackChannel, ":arrow_forward:", `Container ${name} started`, `Container *${name}* started`, image)
}

const down = (name: string, image: string, uptime: string) => {
  return notify(slackChannel, ":octagonal_sign:", `Container ${name} stopped`, `Container *${name}* stopped`, image, uptime, "https://raw.githubusercontent.com/protomodule/docker-watchdog/main/resources/down.png")
}

monitor({
  onMonitorStarted: async (monitor?, docker?) => {
    console.log(`🚀  Monitoring starting`)
    await delay(parseInt(process.env.WARUMUP) || 1000)
    console.log(`🚦  Reporting now enabled in channel <${slackChannel}>`)
    enabled = true
  },
  onMonitorStopped: (monitor?, docker?) => { 
    console.log(`🛑  Monitoring stopped`)
    enabled = false
  },
  onContainerUp: (info, docker) => {
    enabled && up(info.Name, info.Image)
  },
  onContainerDown: (info, docker) => {
    enabled && down(info.Name, info.Image, info.Status)
  },
})
