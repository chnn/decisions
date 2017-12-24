This repository contains the source code for an art project completed at Reed College (for the “Digital Video and Interactive Art” course).

The piece is an interactive film intended to be watched as a group. In the film, a narrative unfolds in short clips. At the end of each clip, the narrative can progress in multiple ways. Participants vote by texting a phone number.

![The title screen for the piece](title-screen.png?raw=true)

![A voting screen for the piece](voting-screen.png?raw=true)

All work was done in collaboration with Michael Kaplan.

### Implementation Notes

This application consists of a [Go](https://golang.org/) server and [Ember](https://emberjs.com/) application.

The [server](https://github.com/chnn/decisions/blob/master/server.go) receives text messages from the [Twilio](https://www.twilio.com/) API, and forwards them to the Ember frontend over a WebSocket connection. The server also serves the static assets for the frontend.

The [`video-layout` component](https://github.com/chnn/decisions/blob/master/app/components/video-layout/component.js) and it's corresponding [template](https://github.com/chnn/decisions/blob/master/app/components/video-layout/template.hbs) are the heart of the frontend. They perform all logic relating to which video to play.
