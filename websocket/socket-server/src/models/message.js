import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Message, IMessage } = require('../../../../models/message.ts');

export { Message, IMessage };
