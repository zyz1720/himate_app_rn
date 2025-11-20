import React, {useState} from 'react';
import {StyleSheet, ActivityIndicator} from 'react-native';
import {
  View,
  TextField,
  Text,
  Button,
  Checkbox,
  Colors,
} from 'react-native-ui-lib';
import {getEmailCode, getImgCaptcha} from '@api/common';
import {userLoginAccount, userLoginCode} from '@api/login';
import {userReg} from '@api/user';
import {useToast} from '@utils/hooks/useToast';
import {validateEmail} from '@utils/common/string_utils';
import {displayName} from '@root/app.json';
import {SvgXml} from 'react-native-svg';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {useUserStore} from '@store/userStore';
import {useSettingStore} from '@store/settingStore';
import {useConfigStore} from '@store/configStore';
import {useTranslation} from 'react-i18next';
import PasswordEye from '@components/form/PasswordEye';
import BaseDialog from '@components/common/BaseDialog';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';

const Login = ({navigation}) => {
  const {t} = useTranslation();
  const {showToast} = useToast();

  const {themeColor} = useSettingStore();
  const {envConfig} = useConfigStore();
  const {login} = useUserStore();

  /* 验证码倒计时 */
  const [sendFlag, setSendFlag] = useState(false);
  const [codetext, setCodetext] = useState(t('login.send_code'));

  let time = 60;
  const addTimer = () => {
    setSendFlag(true);
    const timer = setInterval(() => {
      time -= 1;
      setCodetext(time + 's');
      if (time === 0) {
        clearInterval(timer);
        time = 60;
        setSendFlag(false);
        setCodetext(t('login.send_code'));
      }
    }, 1000);
  };

  /*获取图片验证码 */
  const [imgCodeVisible, setImgCodeVisible] = useState(false);
  const [captchaId, setCaptchaId] = useState(null);
  const [imgCode, setImgCode] = useState(null);
  const [captchaImg, setCaptchaImg] = useState(null);
  const getImgCode = async () => {
    try {
      const res = await getImgCaptcha();
      if (res.code === 0) {
        const {captcha_id, captcha_img} = res.data;
        setCaptchaId(captcha_id);
        setCaptchaImg(captcha_img);
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* 发送验证码 */
  const sendCode = async () => {
    if (account === null || account === '') {
      showToast(t('login.enter_email'), 'error');
      return;
    }
    if (!emailValidate(account)) {
      return;
    }
    try {
      const emailRes = await getEmailCode({
        email: account,
        captchaId: captchaId,
        captchaCode: imgCode,
      });
      if (emailRes.code === 0) {
        addTimer();
      }
      showToast(emailRes.message, emailRes.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 操作类型
   * 1：账号密码登录
   * 2，注册账号
   * 3，忘记密码（验证码登录）
   */
  const [controlCode, setControlCode] = useState(1);
  const [account, setAccount] = useState(null);
  const [password, setPassword] = useState(null);
  const [rePassword, setRePassword] = useState(null);
  const [code, setCode] = useState(null);

  /* 用户登录 */
  const [butDisabled, setButDisabled] = useState(false);
  const userLogin = async () => {
    if (!agreeFlag) {
      showToast('请先阅读并同意协议！', 'error');
      return;
    }
    if (controlCode === 1 || controlCode === 2) {
      if (accountValidate(account) && passwordValidate(password)) {
        try {
          setButDisabled(true);
          const loginRes = await userLoginAccount({
            account,
            password,
          });
          if (loginRes.code === 0) {
            login(loginRes.data);
          }
          showToast(
            loginRes.message,
            loginRes.code === 0 ? 'success' : 'error',
          );
        } catch (error) {
          console.error(error);
        } finally {
          setButDisabled(false);
        }
      }
    }
    if (controlCode === 3) {
      if (emailValidate(account) && codeValidate(code)) {
        try {
          setButDisabled(true);
          const loginRes = await userLoginCode({account, code});
          if (loginRes.code === 0) {
            login(loginRes.data);
          }
          showToast(
            loginRes.message,
            loginRes.code === 0 ? 'success' : 'error',
          );
        } catch (error) {
          console.error(error);
        } finally {
          setButDisabled(false);
        }
      }
    }
  };

  /* 用户注册 */
  const userRegFunc = async () => {
    if (
      emailValidate(account) &&
      codeValidate(code) &&
      passwordValidate(password) &&
      rePassValidate(password, rePassword)
    ) {
      try {
        setButDisabled(true);
        const regRes = await userReg({account, password, code});
        if (regRes.code === 0) {
          const timer = setTimeout(() => {
            userLogin();
            showToast('注册成功！已自动登录', 'success');
            clearTimeout(timer);
          }, 1000);
        } else {
          showToast(regRes.message, 'error');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setButDisabled(false);
      }
    }
  };

  /* 账号校验 */
  const accountValidate = _account => {
    if (!_account) {
      showToast('请输入账号或邮箱！', 'error');
      return false;
    }
    if (_account.length < 6) {
      showToast('请输入正确的账号或邮箱！', 'error');
      return false;
    }
    return true;
  };

  /*  密码校验 */
  const passwordValidate = _password => {
    if (!_password) {
      showToast('请输入密码！', 'error');
      return false;
    }
    if (_password.length < 6) {
      showToast('请输入至少6位密码！', 'error');
      return false;
    }
    return true;
  };

  /* 邮箱校验 */
  const emailValidate = email => {
    if (validateEmail(email)) {
      return true;
    }
    showToast(t('login.email_error'), 'error');
    return false;
  };

  /* 验证码校验 */
  const codeValidate = _code => {
    if (!_code) {
      showToast(t('login.enter_code'), 'error');
      return false;
    }
    if (_code.length !== 6) {
      showToast(t('login.code_error'), 'error');
      return false;
    }
    return true;
  };

  /* 密码二次确认 */
  const rePassValidate = (old_password, new_password) => {
    if (old_password !== new_password) {
      showToast(t('login.verify_password_error'), 'warning');
      return false;
    }
    return true;
  };

  // 显示隐藏密码
  const [hideFlag, setHideFlag] = useState(true);
  const [agreeFlag, setAgreeFlag] = useState(false);

  return (
    <View flexG paddingH-25 paddingT-120 backgroundColor={Colors.white}>
      <View center>
        <View style={[styles.logoBox, {backgroundColor: themeColor}]}>
          <View style={styles.msgBox}>
            <Feather name="message-circle" color={Colors.white} size={84} />
          </View>
          <View style={styles.mouthBox}>
            <Entypo name="dots-two-horizontal" color={Colors.white} size={46} />
          </View>
        </View>
        <Text marginT-12 text40BO>
          {displayName}
        </Text>
      </View>

      <View marginT-20 style={[styles.inputBox, {borderColor: themeColor}]}>
        <FontAwesome name="user-circle-o" color={Colors.grey40} size={20} />
        <TextField
          text70
          style={styles.input}
          placeholder={
            controlCode === 1
              ? t('login.please_email_or_account')
              : t('login.please_email')
          }
          placeholderTextColor={Colors.grey40}
          onChangeText={value => setAccount(value)}
        />
      </View>

      {controlCode !== 1 ? (
        <Animated.View entering={FadeInUp}>
          <View marginT-26 style={[styles.inputBox, {borderColor: themeColor}]}>
            <FontAwesome name="key" color={Colors.grey40} size={20} />
            <TextField
              text70
              style={styles.input}
              placeholderTextColor={Colors.grey40}
              placeholder={t('login.please_code')}
              onChangeText={value => setCode(value)}
            />
            <Button
              style={styles.sendBut}
              size="xSmall"
              link
              disabled={sendFlag}
              color={Colors.primary}
              label={codetext}
              onPress={() => {
                if (emailValidate(account)) {
                  getImgCode();
                  setImgCodeVisible(true);
                }
              }}
            />
          </View>
        </Animated.View>
      ) : null}

      {controlCode !== 3 ? (
        <View marginT-26 style={[styles.inputBox, {borderColor: themeColor}]}>
          <FontAwesome name="keyboard-o" color={Colors.grey40} size={20} />
          <TextField
            text70
            style={styles.input}
            placeholderTextColor={Colors.grey40}
            placeholder={t('login.please_password')}
            secureTextEntry={hideFlag}
            onChangeText={value => setPassword(value)}
          />
          <PasswordEye
            visible={hideFlag}
            setVisible={setHideFlag}
            isFloat={true}
            right={20}
          />
        </View>
      ) : null}

      {controlCode === 2 ? (
        <Animated.View entering={FadeInUp}>
          <View marginT-26 style={[styles.inputBox, {borderColor: themeColor}]}>
            <FontAwesome
              name="check-square-o"
              color={Colors.grey40}
              size={20}
            />
            <TextField
              text70
              style={styles.input}
              placeholderTextColor={Colors.grey40}
              placeholder={t('login.please_confirm_password')}
              onChangeText={value => setRePassword(value)}
              secureTextEntry={true}
            />
          </View>
        </Animated.View>
      ) : null}

      <View marginT-20>
        <View flexG row spread>
          <Button
            style={styles.button}
            link
            text80
            linkColor={controlCode === 3 ? Colors.primary : Colors.grey40}
            label={
              controlCode === 3
                ? t('login.account_login')
                : t('login.forget_password')
            }
            onPress={() => {
              controlCode === 3 ? setControlCode(1) : setControlCode(3);
            }}
          />
          <Button
            style={styles.button}
            link
            text80
            orange30
            label={
              controlCode === 2 ? t('login.account_login') : t('login.register')
            }
            onPress={() => {
              controlCode === 2 ? setControlCode(1) : setControlCode(2);
            }}
          />
        </View>

        <Button
          marginT-20
          label={controlCode === 2 ? t('login.register') : t('login.login')}
          disabled={butDisabled}
          backgroundColor={Colors.primary}
          disabledBackgroundColor={Colors.primary}
          iconOnRight={true}
          iconSource={
            butDisabled ? <ActivityIndicator color={Colors.white} /> : null
          }
          onPress={() => {
            controlCode === 2 ? userRegFunc() : userLogin();
          }}
        />
      </View>
      <View marginT-26 flexS row center>
        <Checkbox
          size={18}
          borderRadius={9}
          color={Colors.primary}
          label={t('login.agree')}
          labelStyle={styles.label}
          value={agreeFlag}
          onValueChange={value => setAgreeFlag(prv => !prv)}
        />
        <Button
          blue40
          link
          size="small"
          label={t('login.user_protocol')}
          onPress={() => {
            navigation.navigate('WebView', {
              title: t('login.user_protocol'),
              url: envConfig.STATIC_URL + 'default_assets/user_protocol.html',
            });
          }}
        />
      </View>

      <BaseDialog
        onConfirm={sendCode}
        visible={imgCodeVisible}
        setVisible={setImgCodeVisible}
        description={t('login.send_code')}
        Body={
          <View>
            <View height={80}>
              <SvgXml width="100%" height="100%" xml={captchaImg} />
            </View>
            <Button
              marginT-8
              label={t('login.change_code')}
              link
              disabled={sendFlag}
              text80L
              linkColor={Colors.primary}
              onPress={getImgCode}
            />
            <TextField
              placeholder={t('login.please_code')}
              text70L
              floatingPlaceholder
              onChangeText={value => {
                setImgCode(value);
              }}
              maxLength={4}
              showCharCounter={true}
            />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoBox: {
    position: 'relative',
    width: 110,
    height: 110,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
  },
  mouthBox: {
    position: 'absolute',
    bottom: 34,
    right: 31,
  },
  msgBox: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  inputBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: Colors.primary,
    padding: 10,
    borderRadius: 12,
    position: 'relative',
  },
  input: {
    padding: 8,
    width: 300,
  },
  sendBut: {
    position: 'absolute',
    right: 16,
  },
  label: {
    color: Colors.grey30,
  },
  button: {
    width: '20%',
  },
});

export default Login;
