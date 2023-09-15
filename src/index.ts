import util from 'util';
import got from 'got';

enum ERecordLevel {
  trace = 10,
  debug = 20,
  info = 30,
  warn = 40,
  error = 50,
  fatal = 60,
}

const defaultOnError = () => {};
function defaultFormatter<T extends { msg: string; level: ERecordLevel }>(
  record: T,
  levelName: keyof typeof ERecordLevel
) {
  return {
    content: util.format('[%s] %s', levelName.toUpperCase(), record.msg),
  };
}

export default class BunyanDiscord<T extends { msg: string; level: ERecordLevel }> {
  webhookUrl: string;
  username?: string;
  avatarUrl?: string;
  customFormatter: (record: T, levelName: keyof typeof ERecordLevel) => { content: string } | { embeds: Embed[] };
  onError: (err: unknown) => void;

  constructor(
    options: Omit<BunyanDiscord<T>, 'write' | 'customFormatter' | 'onError'> & {
      customFormatter?: BunyanDiscord<T>['customFormatter'];
      onError?: BunyanDiscord<T>['onError'];
    }
  ) {
    if (!options.webhookUrl) {
      throw new Error('Webhook url required');
    }
    this.webhookUrl = options.webhookUrl;
    this.username = options.username;
    this.avatarUrl = options.avatarUrl;
    this.customFormatter = options.customFormatter || defaultFormatter;
    this.onError = options.onError || defaultOnError;
  }

  async write(record: Object) {
    try {
      const parsedRecord = typeof record === 'string' ? (JSON.parse(record) as T) : (record as T);
      const levelName = ERecordLevel[parsedRecord.level] as keyof typeof ERecordLevel;

      const message = this.customFormatter(parsedRecord, levelName);
      const body = {
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
