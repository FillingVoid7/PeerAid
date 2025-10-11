import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const User = require('../../../../models/User.ts').default;

export default User;
