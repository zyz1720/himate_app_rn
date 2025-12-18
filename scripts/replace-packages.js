const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const MusicControlIndex = path.join(
  __dirname,
  '..',
  'packages',
  'react-native-music-control',
  'index.js',
);
const MusicControlTypes = path.join(
  __dirname,
  '..',
  'packages',
  'react-native-music-control',
  'index.d.ts',
);
const MusicControlModule = path.join(
  __dirname,
  '..',
  'packages',
  'react-native-music-control',
  'MusicControlModule.java',
);
const MusicControlNotification = path.join(
  __dirname,
  '..',
  'packages',
  'react-native-music-control',
  'MusicControlNotification.java',
);
const RNAudioRecorderPlayerModule = path.join(
  __dirname,
  '..',
  'packages',
  'react-native-audio-recorder-player',
  'RNAudioRecorderPlayerModule.kt',
);

const _MusicControlIndex = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-music-control',
  'lib',
  'index.js',
);
const _MusicControlTypes = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-music-control',
  'lib',
  'index.d.ts',
);
const _MusicControlModule = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-music-control',
  'android',
  'src',
  'main',
  'java',
  'com',
  'tanguyantoine',
  'react',
  'MusicControlModule.java',
);
const _MusicControlNotification = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-music-control',
  'android',
  'src',
  'main',
  'java',
  'com',
  'tanguyantoine',
  'react',
  'MusicControlNotification.java',
);
const _RNAudioRecorderPlayerModule = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-audio-recorder-player',
  'android',
  'src',
  'main',
  'java',
  'com',
  'dooboolab.audiorecorderplayer',
  'RNAudioRecorderPlayerModule.kt',
);

// 打印分隔线和标题
console.log(chalk.gray('='.repeat(60)));
console.log(chalk.blueBright.bold('开始执行文件复制任务'));
console.log(chalk.gray('='.repeat(60)));

console.log(chalk.yellow('正在复制文件...'));
console.log(chalk.gray('-'.repeat(60)));

// 显示模块路径信息（表格样式）
const modules = [
  {
    name: chalk.yellow('音乐控制模块入口'),
    source: MusicControlIndex,
    dest: _MusicControlIndex,
  },
  {
    name: chalk.yellow('音乐控制类型定义'),
    source: MusicControlTypes,
    dest: _MusicControlTypes,
  },
  {
    name: chalk.green('音乐控制模块'),
    source: MusicControlModule,
    dest: _MusicControlModule,
  },
  {
    name: chalk.cyan('音乐控制通知'),
    source: MusicControlNotification,
    dest: _MusicControlNotification,
  },
  {
    name: chalk.magenta('音频播放模块'),
    source: RNAudioRecorderPlayerModule,
    dest: _RNAudioRecorderPlayerModule,
  },
];

modules.forEach(module => {
  console.log(chalk.bold(module.name));
  console.log(chalk.blue('源文件:'), chalk.white(module.source));
  console.log(chalk.red('目标文件:'), chalk.white(module.dest));
  console.log(chalk.gray('-'.repeat(60)));
});

try {
  if (
    !fs.existsSync(MusicControlTypes) ||
    !fs.existsSync(MusicControlIndex) ||
    !fs.existsSync(MusicControlModule) ||
    !fs.existsSync(MusicControlNotification) ||
    !fs.existsSync(RNAudioRecorderPlayerModule)
  ) {
    throw new Error('源文件不存在！');
  }

  fs.copyFileSync(MusicControlTypes, _MusicControlTypes);
  fs.copyFileSync(MusicControlIndex, _MusicControlIndex);
  fs.copyFileSync(MusicControlModule, _MusicControlModule);
  fs.copyFileSync(MusicControlNotification, _MusicControlNotification);
  fs.copyFileSync(RNAudioRecorderPlayerModule, _RNAudioRecorderPlayerModule);

  console.log(chalk.green('✓ 文件复制成功！'));

  // 验证复制是否成功
  const sourceMusicControlTypesContent = fs.readFileSync(
    MusicControlTypes,
    'utf8',
  );
  const destMusicControlTypesContent = fs.readFileSync(
    _MusicControlTypes,
    'utf8',
  );
  const sourceMusicControlIndexContent = fs.readFileSync(
    MusicControlIndex,
    'utf8',
  );
  const destMusicControlIndexContent = fs.readFileSync(
    _MusicControlIndex,
    'utf8',
  );
  const sourceMusicControlModuleContent = fs.readFileSync(
    MusicControlModule,
    'utf8',
  );
  const destMusicControlModuleContent = fs.readFileSync(
    _MusicControlModule,
    'utf8',
  );
  const sourceMusicControlNotificationContent = fs.readFileSync(
    MusicControlNotification,
    'utf8',
  );
  const destMusicControlNotificationContent = fs.readFileSync(
    _MusicControlNotification,
    'utf8',
  );
  const sourceRNAudioRecorderPlayerModuleContent = fs.readFileSync(
    RNAudioRecorderPlayerModule,
    'utf8',
  );
  const destRNAudioRecorderPlayerModuleContent = fs.readFileSync(
    _RNAudioRecorderPlayerModule,
    'utf8',
  );

  if (
    sourceMusicControlTypesContent === destMusicControlTypesContent &&
    sourceMusicControlModuleContent === destMusicControlModuleContent &&
    sourceMusicControlNotificationContent ===
      destMusicControlNotificationContent &&
    sourceRNAudioRecorderPlayerModuleContent ===
      destRNAudioRecorderPlayerModuleContent &&
    sourceMusicControlIndexContent === destMusicControlIndexContent
  ) {
    console.log(chalk.green.bold('✓ 文件内容完全一致，替换成功！'));
  } else {
    console.log(chalk.yellow.bold('⚠️  文件内容不一致，可能存在问题！'));
  }

  // 任务完成
  console.log(chalk.gray('='.repeat(60)));
  console.log(chalk.blueBright.bold('文件复制任务执行完毕'));
  console.log(chalk.gray('='.repeat(60)));
} catch (error) {
  console.log(chalk.red.bold('✗ 文件复制失败:'), chalk.red(error.message));
  console.log(chalk.gray('='.repeat(60)));
  process.exit(1);
}
