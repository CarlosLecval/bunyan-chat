import util from 'util';
import got from 'got';
import { MessageAttachment } from '@slack/types';

enum ERecordLevel {
  trace = 10,
  debug = 20,
  info = 30,
  warn = 40,
  error = 50,
  fatal = 60,
}

const defaultOnError = () => {};
function defaultSlackFormatter<T extends { msg: string; level: ERecordLevel }>(
  record: T,
  levelName: keyof typeof ERecordLevel
) {
  return {
    text: util.format('[%s] %s', levelName.toUpperCase(), record.msg),
  };
}

function defaultDiscordFormatter<T extends { msg: string; level: ERecordLevel }>(
  record: T,
  levelName: keyof typeof ERecordLevel
) {
  return {
    content: util.format('[%s] %s', levelName.toUpperCase(), record.msg),
  };
}

type bunyanDiscordOptions<T extends { msg: string; level: ERecordLevel }> = Omit<
  BunyanChat<T>,
  'write' | 'onError' | 'type' | 'channel' | 'iconUrl' | 'iconEmoji'
> & {
  type: 'discord';
  customFormatter?: BunyanChat<T>['discordCustomFormatter'];
  onError?: BunyanChat<T>['onError'];
};

type bunyanSlackOptions<T extends { msg: string; level: ERecordLevel }> = Omit<
  BunyanChat<T>,
  'write' | 'onError' | 'type' | 'avatarUrl'
> & {
  type: 'slack';
  customFormatter?: BunyanChat<T>['slackCustomFormatter'];
  onError?: BunyanChat<T>['onError'];
};

export default class BunyanChat<T extends { msg: string; level: ERecordLevel }> {
  type: 'discord' | 'slack';
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
  channel?: string;
  iconUrl?: string;
  iconEmoji?: string;
  discordCustomFormatter?: (
    record: T,
    levelName: keyof typeof ERecordLevel
  ) => { content: string } | { embeds: Embed[] };
  slackCustomFormatter?: (
    record: T,
    levelName: keyof typeof ERecordLevel
  ) => { text: string } | { attachments: MessageAttachment[] };
  onError: (err: unknown) => void;

  constructor(options: bunyanDiscordOptions<T> | bunyanSlackOptions<T>) {
    if (!options.webhookUrl) {
      throw new Error('Webhook url required');
    }
    this.type = options.type;
    this.webhookUrl = options.webhookUrl;
    this.username = options.username;
    if (options.type === 'discord') {
      this.avatarUrl = options.avatarUrl;
      this.discordCustomFormatter = options.customFormatter || defaultDiscordFormatter;
    }
    if (options.type === 'slack') {
      this.channel = options.channel;
      this.iconUrl = options.iconUrl;
      this.iconEmoji = options.iconEmoji;
      this.slackCustomFormatter = options.customFormatter || defaultSlackFormatter;
    }
    this.onError = options.onError || defaultOnError;
  }

  async write(record: Object) {
    try {
      const parsedRecord = typeof record === 'string' ? (JSON.parse(record) as T) : (record as T);
      const levelName = ERecordLevel[parsedRecord.level] as keyof typeof ERecordLevel;

      const message =
        this.type === 'slack'
          ? this.slackCustomFormatter!(parsedRecord, levelName)
          : this.discordCustomFormatter!(parsedRecord, levelName);
      const body =
        this.type === 'slack'
          ? {
              channel: this.channel,
              username: this.username,
              icon_url: this.iconUrl,
              icon_emoji: this.iconEmoji,
              ...message,
            }
          : {
              username: this.username,
              avatarUrl: this.avatarUrl,
              ...message,
            };
      await got.post(this.webhookUrl, { json: body });
    } catch (err) {
      this.onError(err);
    }
  }
}
