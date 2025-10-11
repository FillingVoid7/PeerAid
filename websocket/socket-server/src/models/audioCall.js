// ES module wrapper for importing CommonJS models 
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { AudioCall, IAudioCall } = require('../../../../models/audioCall.ts');

export { AudioCall, IAudioCall };
