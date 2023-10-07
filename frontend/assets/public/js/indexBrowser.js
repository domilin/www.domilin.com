import JsEncrypt from 'jsencrypt'

/**
 * @desc 密码加密
 * @returns {string}
 * @Params {password}
 * @method encodePassword(password)
 */

const publicKey = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgGi3THYuRs9WzylwCj1LjufHOUfl
5aXI3Gf76GNGDe+9IOvVrtjjBnpFtnEekToRcA9WqH9YY5lgD4lD9zxaTvVtyGBH
APfIshIKqAiB5PK2Z8oM8mGYPF0y03JNIwhLXpC0+AT6UDXZ+pUAnlX2C/VEIPof
iJRFUuWTfVfVIDcdAgMBAAE=
-----END PUBLIC KEY-----`
const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
export const encodePassword = (password) => {
    const encrypt = new JsEncrypt()
    encrypt.setPublicKey(publicKey)
    return encrypt.encrypt(JSON.stringify({
        password: password.toString(),
        nonce: randomNumber(0, 1000000).toString(),
        timestamp: (Date.parse(new Date()) / 1000).toString()
    }))
}
