/**
项目级 React Native CLI 配置。
修复方案：
针对 wix/react-native-ui-lib issue #3950 的临时解决方案：
上游修复（PR #4014）尚未发布。一旦发布了修复后的
react-native-ui-lib / uilib-native 版本，移除此覆盖配置。
https://github.com/wix/react-native-ui-lib/issues/3950
*/
module.exports = {
  dependencies: { 
    'react-native-ui-lib': {
      platforms: {
        android: null,
      },
    },
    'uilib-native': {
      platforms: {
        android: {
          sourceDir: './android/',
          packageImportPath:
            'import com.wix.reactnativeuilib.dynamicfont.DynamicFontPackage;',
          packageInstance: `new DynamicFontPackage(),
      new com.wix.reactnativeuilib.highlighterview.HighlighterViewPackage(),
      new com.wix.reactnativeuilib.keyboardinput.KeyboardInputPackage(getApplication())`,
        },
      },
    },
  },
};
