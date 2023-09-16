import Bunyan from 'bunyan';
import got from 'got';
import BunyanChat from 'bunyan-chat';

describe('Bunyan-chat Discord integration', () => {
  describe('constructor', function() {
    it('should require a webhook', function() {
      expect(function() {
        new BunyanChat({} as any);
      }).toThrow(new Error('Webhook url required'));
    });

    it('should set options', function() {
      const spy = jest.spyOn(got, 'post').mockReturnValueOnce({ success: true } as any);

      const options = {
        type: 'discord' as const,
        webhookUrl: 'mywebhookurl',
        username: '@carloslecval',
        avatarUrl: 'https://avatars.githubusercontent.com/u/61945879?v=4',
      };

      const log = Bunyan.createLogger({
        name: 'myapp',
        streams: [{ type: 'raw', stream: new BunyanChat(options) }],
        level: 'info',
      });

      const logText = 'foobar';
      log.info(logText);
      expect(spy).toHaveBeenCalledWith(options.webhookUrl, {
        json: {
          username: options.username,
          avatarUrl: options.avatarUrl,
          content: `[INFO] ${logText}`,
        },
      });
    });

    it('should use the custom formatter', function() {
      const spy = jest.spyOn(got, 'post').mockReturnValueOnce({ success: true } as any);

      const options = {
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
      };

      const log = Bunyan.createLogger({
        name: 'myapp',
        streams: [{ type: 'raw', stream: new BunyanChat(options) }],
        level: 'info',
      });

      const logText = 'foobar';
      log.info(logText);
      expect(spy).toHaveBeenCalledWith(options.webhookUrl, {
        json: {
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
                  name: `We have a new info log`,
                  value: 'foobar',
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('error handler', function() {
    it('should use the custom error handler', function() {
      const onError = jest.fn();

      const options = {
        type: 'discord' as const,
        webhookUrl: 'mywebhookurl',
        customFormatter: (record: any) => {
          return record.foo();
        },
        onError,
      };

      const log = Bunyan.createLogger({
        name: 'myapp',
        streams: [{ type: 'raw', stream: new BunyanChat(options) }],
        level: 'info',
      });
      log.info('foobar');
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
