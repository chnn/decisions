This repository contains an [ART 296](http://people.reed.edu/~miyos/S17/DM2/dm2_syllabus_s17.html) project. 

### Implementation Notes

This application consists of a [Go](https://golang.org/) server and [Ember](https://emberjs.com/) application.

The [server](https://github.com/chnn/decisions/blob/master/server.go) receives text messages from the [Twilio](https://www.twilio.com/) API, and forwards them to the Ember frontend over a WebSocket connection. The server also serves the static assets for the frontend.

The [`video-layout` component](https://github.com/chnn/decisions/blob/master/app/components/video-layout/component.js) and it's corresponding [template](https://github.com/chnn/decisions/blob/master/app/components/video-layout/template.hbs) are the heart of the frontend. They perform all logic relating to which video to play.
