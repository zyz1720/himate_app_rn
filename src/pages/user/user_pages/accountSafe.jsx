import React, {useEffect, useState} from 'react';
import {StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {View, Text, Card, Colors, TextField, Button} from 'react-native-ui-lib';
import {useToast} from '@utils/hooks/useToast';
import {editUserAccount, editUserPassword, getUserInfo} from '@api/user';
import {validateEmail} from '@utils/common/string_utils';
import {useUserStore} from '@store/userStore';
import {getEmailCode, getImgCaptcha} from '@api/common';
import {useTranslation} from 'react-i18next';
import {SvgXml} from 'react-native-svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FullScreenLoading from '@components/common/FullScreenLoading';
import BaseDialog from '@components/common/BaseDialog';
import PasswordEye from '@components/form/PasswordEye';

let timer = {};
const EditUser = ({route}) => {
  const {t} = useTranslation();
  const {setUserInfo, logout, logoff} = useUserStore();

  const {showToast} = useToast();
  const [userAccount, setUserAccount] = useState({});
  const [userEmail, setUserEmail] = useState(null);
  const [code, setCode] = useState(null);
  const [oldPassword, setOldPassword] = useState(null);
  const [newPassword, setNewPassword] = useState(null);

  // 初始化数据
  const dataInit = async () => {
    try {
      setRefreshing(true);
      const res = await getUserInfo();
      if (res.code === 0) {
        const {account} = res.data;
        setUserAccount(account);
        setUserEmail(account);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
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

  const isNeedSave = value => {
    if (userAccount === value) {
      return false;
    }
    return true;
  };

  // 保存修改
  const [emailShow, setEmailShow] = useState(false);
  const [passwordShow, setPasswordShow] = useState(false);

  /* 验证码倒计时 */
  const [sendFlag, setSendFlag] = useState(false);
  const [codetext, setCodetext] = useState(t('common.save'));
  let time = 60;
  const addTimer = () => {
    setSendFlag(true);
    timer = setInterval(() => {
      time -= 1;
      setCodetext(time + 's');
      if (time === 0) {
        clearInterval(timer);
        time = 60;
        setSendFlag(false);
        setCodetext(t('common.save'));
      }
    }, 1000);
  };

  /* 邮箱校验 */
  const emailValidate = email => {
    if (validateEmail(email)) {
      return true;
    }
    showToast(t('login.email_error'), 'error');
    return false;
  };

  /* 发送验证码 */
  const sendCode = async () => {
    if (userAccount === null || userAccount === '') {
      showToast(t('login.enter_email'), 'error');
      return;
    }
    if (!emailValidate(userAccount)) {
      return;
    }
    try {
      const emailRes = await getEmailCode({
        email: userAccount,
        captchaId: captchaId,
        captchaCode: imgCode,
      });
      if (emailRes.code === 0) {
        addTimer();
        setShowCodeDialog(true);
      }
      showToast(emailRes.message, emailRes.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    }
  };

  // 提交修改
  const [uploading, setUploading] = useState(false);
  const submitEmail = async () => {
    if (userEmail === null || userEmail === '') {
      showToast(t('empty.input'), 'error');
      return;
    }
    if (!emailValidate(userEmail)) {
      showToast(t('user.email_invalid'), 'error');
      return;
    }
    try {
      setUploading(true);
      const res = await editUserAccount({
        newAccount: userEmail,
        code: code,
      });
      if (res.code === 0) {
        setUserInfo();
      }
      showToast(res.message, res.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  /*  密码校验 */
  const passwordValidate = _password => {
    if (!_password) {
      showToast(t('login.please_old_password'), 'error');
      return false;
    }
    if (_password.length < 6) {
      showToast(t('user.password_too_short'), 'error');
      return false;
    }
    return true;
  };

  const submitPassword = async () => {
    if (!passwordValidate(oldPassword)) {
      return;
    }
    try {
      setUploading(true);
      const res = await editUserPassword({
        password: newPassword,
        oldPassword: oldPassword,
        code: code,
      });
      showToast(res.message, res.code === 0 ? 'success' : 'error');
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // 刷新页面
  const [refreshing, setRefreshing] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showPassDialog, setShowPassDialog] = useState(false);

  // 下划线
  const renderLine = () => {
    const arr = [1, 2, 3, 4, 5, 6];
    return arr.map(item => {
      return <View key={item} style={styles.codeBoxLine} />;
    });
  };

  // 显示隐藏密码
  const [hideFlag, setHideFlag] = useState(true);
  const [hideFlagOld, setHideFlagOld] = useState(true);

  // 退出登录
  const [showLoginOut, setShowLoginOut] = useState(false);
  const userLogout = () => {
    logout();
    showToast(t('user.log_out_success'), 'success');
  };

  // 注销账号
  const [showLogOff, setShowLogOff] = useState(false);
  const userLogoff = () => {
    logoff();
    showToast(t('user.log_off_success'), 'success');
  };

  useEffect(() => {
    dataInit();
  }, []);

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl
            colors={[Colors.primary]}
            refreshing={refreshing}
            onRefresh={dataInit}
          />
        }>
        <View flexG paddingH-16 paddingT-16>
          <View marginB-16 flexG center>
            <Text center>
              <FontAwesome
                name="exclamation-circle"
                color={Colors.yellow40}
                size={14}
              />
              <Text text90L grey30>
                {t('user.change_email')}
              </Text>
            </Text>
          </View>
          <Card flexS padding-16>
            <View flexG row spread centerV style={styles.inputLine}>
              <TextField
                label={t('user.bind_email')}
                labelColor={Colors.grey40}
                text70
                enableErrors={emailShow}
                style={styles.input}
                placeholder={t('user.new_email')}
                placeholderTextColor={Colors.grey50}
                validate={[
                  value => value.length !== 0,
                  value => validateEmail(value),
                ]}
                validationMessage={[
                  t('user.email_empty'),
                  t('user.email_invalid'),
                ]}
                value={userEmail}
                validateOnChange={true}
                onChangeText={value => {
                  setUserEmail(value);
                  setEmailShow(isNeedSave(value));
                }}
                onBlur={() => {
                  setEmailShow(isNeedSave(userEmail));
                }}
              />
              {emailShow ? (
                <View marginB-20>
                  <Button
                    label={codetext}
                    size={Button.sizes.small}
                    borderRadius={8}
                    disabled={sendFlag}
                    backgroundColor={Colors.primary}
                    onPress={() => {
                      setImgCodeVisible(true);
                      getImgCode();
                    }}
                  />
                </View>
              ) : null}
            </View>
            <View flexG row spread centerV marginT-16>
              <TextField
                label={t('user.new_password')}
                labelColor={Colors.grey40}
                text70
                enableErrors={passwordShow}
                style={styles.input}
                placeholder={t('user.new_password_placeholder')}
                placeholderTextColor={Colors.grey50}
                validate={[password => password.length > 5]}
                validationMessage={[t('user.password_too_short')]}
                validateOnChange={true}
                value={newPassword}
                secureTextEntry={hideFlag}
                onChangeText={value => {
                  setNewPassword(value);
                  setPasswordShow(true);
                }}
              />
              <PasswordEye setVisible={setHideFlag} visible={hideFlag} />
              {passwordShow ? (
                <Button
                  label={codetext}
                  size={Button.sizes.small}
                  borderRadius={8}
                  disabled={sendFlag}
                  backgroundColor={Colors.primary}
                  onPress={() => {
                    setShowPassDialog(true);
                  }}
                />
              ) : null}
            </View>
          </Card>

          <Button
            marginT-16
            bg-white
            text70
            red30
            label={t('user.log_off')}
            borderRadius={12}
            onPress={() => setShowLogOff(true)}
          />
          <Button
            bg-white
            marginT-16
            text70
            orange40
            borderRadius={12}
            label={t('common.log_out')}
            onPress={() => setShowLoginOut(true)}
          />
        </View>
      </ScrollView>
      <BaseDialog
        onConfirm={() => {
          submitEmail();
        }}
        onCancel={() => {
          setUploading(false);
        }}
        visible={showCodeDialog}
        setVisible={setShowCodeDialog}
        description={t('user.bind_email')}
        renderBody={
          <>
            <View>
              <TextField
                style={styles.letterSpacing}
                label={t('user.code')}
                text40
                value={code}
                onChangeText={value => {
                  if (value.length > 6) {
                    return;
                  }
                  setCode(value);
                }}
              />
            </View>
            <View flexS row spread paddingH-8>
              {renderLine()}
            </View>
          </>
        }
      />
      <BaseDialog
        onConfirm={() => {
          submitPassword();
        }}
        onCancel={() => {
          setUploading(false);
        }}
        visible={showPassDialog}
        setVisible={setShowPassDialog}
        description={t('user.change_password')}
        renderBody={
          <View style={styles.inputLine}>
            <View>
              <TextField
                label={t('user.old_password')}
                text70
                style={styles.input}
                value={oldPassword}
                secureTextEntry={hideFlagOld}
                onChangeText={value => {
                  setOldPassword(value);
                }}
              />
              <PasswordEye
                setVisible={setHideFlagOld}
                visible={hideFlagOld}
                isFloat={true}
                right={20}
                bottom={6}
              />
            </View>
          </View>
        }
      />
      <BaseDialog
        title={true}
        onConfirm={userLogout}
        visible={showLoginOut}
        setVisible={setShowLoginOut}
        description={t('user.log_out_confirm')}
      />
      <BaseDialog
        title={true}
        onConfirm={userLogoff}
        visible={showLogOff}
        setVisible={setShowLogOff}
        description={t('user.log_off_confirm')}
      />
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
      {uploading ? <FullScreenLoading Message={t('common.modifying')} /> : null}
    </>
  );
};
const styles = StyleSheet.create({
  image: {width: 60, height: 60, borderRadius: 8, marginRight: 12},
  input: {
    width: 200,
  },
  inputLine: {
    borderBottomColor: Colors.grey60,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  codeBoxLine: {
    width: 40,
    borderBottomColor: Colors.grey50,
    borderBottomWidth: 1,
  },
  letterSpacing: {
    letterSpacing: 34,
  },
});
export default EditUser;
