# Docker watchdog for Slack

[![🐳 Docker build](https://github.com/protomodule/docker-watchdog/actions/workflows/dockerhub.yml/badge.svg)](https://github.com/protomodule/docker-watchdog/actions)

Sends notifications whenever a container starts or stops

## 🐳 Run

### Configure Slack App

 1. Add a [Slack app](https://api.slack.com/apps)
 1. Create a bot user
 1. Add `chat:write` and `chat:write.public` and `chat:write.customize` to the OAuth & Permissions of the app
 1. Note down the *Bot User OAuth Token*. This token starts with `xoxb-`. This token goes into the `SLACK_TOKEN` environment variable for the container.

### Start

```bash
docker run --name watchdog \
  --detach \
  --restart=unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e SLACK_CHANNEL='#general' \
  -e SLACK_TOKEN='xoxb-***' \
  -e ENVIRONMENT='Production' \
  protomodule/docker-watchdog
```

## 🧑‍💻 Development

### Build

```bash
docker build -t protomodule/docker-watchdog .
```
