import {Buffer} from 'buffer';
import {createRandomLetters} from '@utils/common/string_utils';
import QuickCrypto from 'react-native-quick-crypto';

/**
 * AES加密函数
 * @param {string} text 待加密文本
 * @param {string} secretKey 密钥
 * @returns {Object} {iv, encryptedData} 初始化向量和加密数据
 */
export const encryptAES = (text, secretKey) => {
  const JsonText = JSON.stringify(text);
  const iv = QuickCrypto.randomBytes(16);
  const hashed = QuickCrypto.createHash('sha256')
    .update(String(secretKey))
    .digest('hex');

  const key = Buffer.from(hashed, 'hex');
  const cipher = QuickCrypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    iv,
  );
  let encrypted = cipher.update(JsonText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {iv: iv.toString('hex'), encryptedData: encrypted};
};

/**
 * AES解密函数
 * @param {string} encryptedData 加密数据
 * @param {string} iv 初始化向量
 * @param {string} secretKey 密钥
 * @returns {string|null} 解密后的文本或null
 */
export const decryptAES = (encryptedData, iv, secretKey) => {
  const hashed = QuickCrypto.createHash('sha256')
    .update(String(secretKey))
    .digest('hex'); // 生成哈希值
  const key = Buffer.from(hashed, 'hex'); // 生成密钥
  const decipher = QuickCrypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    Buffer.from(iv, 'hex'),
  );
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  try {
    return JSON.parse(decrypted);
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * 生成秘钥库函数
 * @param {string} msgSecret 消息密钥
 * @returns {string} 生成的秘钥库
 */
export const generateSecretKey = msgSecret => {
  const secretHash = QuickCrypto.createHash('sha256').update(String(msgSecret));
  const secretReHash = QuickCrypto.createHash('sha256').update(
    String(msgSecret.split('').reverse().join('')),
  );
  const secretKey1 = secretHash.digest('base64');
  const secretKey2 = secretHash.digest('hex');
  const secretKey3 = secretReHash.digest('base64');
  const secretKey4 = secretReHash.digest('hex');
  return secretKey1 + secretKey2 + secretKey3 + secretKey4;
};

/**
 * 生成随机秘钥位置函数
 * @param {string} secretStr 秘钥字符串
 * @returns {Object} {secret, trueSecret} 随机秘钥位置和真正的秘钥
 */
export const createRandomSecretKey = secretStr => {
  const indexList = [];
  const secretList = [];
  for (let i = 0; i < 8; i++) {
    const index = Math.floor(Math.random() * (secretStr.length - 1));
    indexList.push(
      index,
      createRandomLetters(Math.floor(Math.random() * 4) + 1),
    );
    secretList.push(secretStr.charAt(index));
  }
  return {
    secret: indexList.join(''),
    trueSecret: secretList.join(''),
  };
};

/**
 * 获取真正的秘钥函数
 * @param {string} secret 随机秘钥位置
 * @param {string} secretStr 秘钥字符串
 * @returns {string} 真正的秘钥
 */
export const getTrueSecretKey = (secret, secretStr) => {
  const indexList = secret.match(/\d+/g);
  const secretList = [];
  indexList.forEach((index, i) => {
    secretList.push(secretStr.charAt(index));
  });
  return secretList.join('');
};
