module.exports = {
  appId: 'com.eduquest.kids',
  appName: 'EduQuest Kids',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'],
  },
  android: {
    buildOptions: {
      keystorePath: 'eduquest-release.keystore',
      keystoreAlias: 'eduquest',
      keystorePassword: 'eduquest2024',
      keystoreAliasPassword: 'eduquest2024',
    },
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#9333ea',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

