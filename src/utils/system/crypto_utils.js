import {Buffer} from 'buffer';
import {reverseString} from '@utils/common/string_utils';
import QuickCrypto from 'react-native-quick-crypto';

export const createHash = str => {
  return QuickCrypto.createHash('sha256').update(str).digest('hex');
};

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
  const secretHash = QuickCrypto.createHash('sha512').update(String(msgSecret));
  const secretReHash = QuickCrypto.createHash('sha512').update(
    String(reverseString(msgSecret)),
  );
  const secretKey = secretHash.digest('hex');
  const secretReKey = secretReHash.digest('hex');
  return secretKey + secretReKey;
};

/**
 * 生成随机秘钥位置函数
 * @param {string} secretStr 秘钥字符串
 * @returns {Object} {secret, trueSecret} 随机秘钥位置和真正的秘钥
 */
export const createRandomSecretKey = secretStr => {
  const is = [];
  const ss = [];
  const i1 = () => Math.floor(Math.random() * 9) + 1;
  const i2 = () => Math.floor(Math.random() * 90) + 10;
  const i3 = () => Math.floor(Math.random() * (256 - 100 + 1)) + 100;
  for (let i = 0; i < 7; i++) {
    if (i === 0) {
      const _i3 = i3();
      is.push(_i3);
      ss.push(secretStr.charAt(_i3));
    }
    if (i === 1) {
      const _i1 = i1();
      is.push(_i1);
      ss.push(secretStr.charAt(_i1));
    }
    if (i === 2) {
      const _i2 = i2();
      is.push(_i2);
      ss.push(secretStr.charAt(_i2));
    }
    if (i === 3) {
      const _i1 = i1();
      is.push(_i1);
      ss.push(secretStr.charAt(_i1));
    }
    if (i === 4) {
      const _i3 = i3();
      is.push(_i3);
      ss.push(secretStr.charAt(_i3));
    }
    if (i === 5) {
      const _i2 = i2();
      is.push(_i2);
      ss.push(secretStr.charAt(_i2));
    }
    if (i === 6) {
      const _i3 = i3();
      is.push(_i3);
      ss.push(secretStr.charAt(_i3));
    }
  }
  return {
    secret: is.join(''),
    trueSecret: ss.join(''),
  };
};

/**
 * 获取真正的秘钥函数
 * @param {string} s 随机秘钥位置
 * @param {string} ss 秘钥字符串
 * @returns {string} 真正的秘钥
 */
export const getTrueSecretKey = (s, ss) => {
  const is = [
    s.substring(0, 3),
    s.substring(3, 4),
    s.substring(4, 6),
    s.substring(6, 7),
    s.substring(7, 10),
    s.substring(10, 12),
    s.substring(12, 15),
  ];
  const sl = [];
  is.forEach(i => {
    sl.push(ss.charAt(i));
  });
  return sl.join('');
};
