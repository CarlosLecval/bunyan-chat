# bunyan-chat

**Bunyan stream for chat integrations**

Currently just Slack and Discord

First install bunyan...

```
npm install bunyan
```

Then install bunyan-chat

```
npm install bunyan-chat
```

## Slack Setup

```typescript
import Bunyan from 'bunyan';
import BunyanChat from 'bunyan-chat';

const log = bunyan.createLogger({
  name: 'myApp',
  streams: [
    {
      type: 'raw',
      stream: new BunyanChat({
        type: 'slack',
        webhookUrl: 'your_webhook_url',
        channel: '#your_channel',
        username: 'your_username',
        iconEmoji: ':smile:',
        iconUrl: 'your_icon_url',
      }),
    },
  ],
  level: 'error',
});

log.error('hello bunyan slack');
```

> Specify a Slack channel by name with `"channel": "#other-channel"`, or send a Slackbot message to a specific user with `"channel": "@username"`.

Custom formatter supports array of message attachments

All fields are optional except `webhookUrl` and `type`

## Discord Setup

```typescript
import Bunyan from 'bunyan';
import BunyanChat from 'bunyan-chat';

const log = bunyan.createLogger({
  name: 'myApp',
  streams: [
    {
      type: 'raw',
      stream: new BunyanChat({
        type: 'discord',
        webhookUrl: 'your_webhook_url',
        username: 'your_username',
        avatarUrl: 'your_avatar_url',
      }),
    },
  ],
  level: 'error',
});

log.error('hello bunyan discord');
```

Custom formatter supports array of embeds

All fields are optional except `webhookUrl` and `type`

## Optional error handlers

You can also pass an optional error handler.

```typescript
const stream = new BunyanChat({
  type: 'slack',
  webhookUrl: 'your_webhook_url',
  channel: '#your_channel',
  username: 'your_username',
  onError: function(error) {
    console.log(error);
  },
});
```

## Custom Formatters

By default the logs are formatted like so: `[LOG_LEVEL] message`, unless you specify a `customFormatter` function.

```typescript
const log = bunyan.createLogger({
  name: 'myApp',
  stream: new BunyanChat({
    type: 'slack',
    webhookUrl: 'your_webhook_url',
    channel: '#your_channel',
    username: 'your_username',
    customFormatter: function(record, levelName) {
      return { text: '[' + levelName + '] ' + record.msg };
    },
  }),
  level: 'error',
});
```

Using slack message attachments

```typescript
import Bunyan from 'bunyan';
import BunyanChat from 'bunyan-chat';

const log = bunyan.createLogger({
  name: 'myapp',
  stream: new BunyanChat({
    type: 'slack',
    webhookUrl: 'your_webhook_url',
    iconUrl: 'your_icon_url',
    channel: '#your_channel',
    username: 'your_username',
    iconEmoji: ':scream_cat:',
    customFormatter: function(record, levelName) {
      return {
        attachments: [
          {
            fallback: 'Required plain-text summary of the attachment.',
            color: '#36a64f',
            pretext: 'Optional text that appears above the attachment block',
            author_name: 'Bunyan chat'
            author_link: 'your_author_link',
            author_icon: 'your_author_icon',
            title: 'Slack API Documentation',
            title_link: 'https://api.slack.com/',
            text: 'Optional text that appears within the attachment',
            fields: [
              {
                title: 'We have a new ' + levelName + ' log',
                value: ':scream_cat: ' + record.msg,
                short: true,
              },
            ],
          },
        ],
      };
    },
  }),
  level: 'error',
});
```

Using discord embeds

```typescript
const log = Bunyan.createLogger({
  name: 'myapp',
  streams: [
    {
      type: 'raw',
      stream: new BunyanChat({
        type: 'discord' as const,
        webhookUrl: 'mywebhookurl',
        customFormatter: (record: any, levelName: string) => {
          return {
            embeds: [
              {
                color: 7019426,
                title: 'Discord API Documentation',
                url: 'https://discord.com/developers/docs/intro',
                description: 'Optional text that appears within the attachment',
                author: {
                  name: 'Carloslecval',
                  url: 'https://avatars.githubusercontent.com/u/61945879?v=4',
                },
                fields: [
                  {
                    name: `We have a new ${levelName} log`,
                    value: `${record.msg}`,
                  },
                ],
              },
            ],
          };
        },
      }),
    },
  ],
  level: 'info',
});
```

---

This library was adapted from [bunyan-slack](https://github.com/qualitybath/bunyan-slack)

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
