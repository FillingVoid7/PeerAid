import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { Conversation, IConversation } = require('../../../../models/chatConversation.ts');

export { Conversation, IConversation };
