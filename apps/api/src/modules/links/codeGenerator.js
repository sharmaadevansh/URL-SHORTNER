import crypto from 'crypto';
import { BASE62_CHARACTERS, SHORT_CODE_LENGTH } from '@linkforge/shared';
export function generateShortCode(length = SHORT_CODE_LENGTH) {
    const bytes = crypto.randomBytes(length);
    let result = '';
    const charsLength = BASE62_CHARACTERS.length;
    for (let i = 0; i < length; i++) {
        result += BASE62_CHARACTERS[bytes[i] % charsLength];
    }
    return result;
}
