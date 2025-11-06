// Carregar variáveis de ambiente do keystore
// Fallback para valores padrão se não estiverem definidas
const keystorePath = process.env.KEYSTORE_PATH || 'eduquest-release.keystore';
const keystoreAlias = process.env.KEYSTORE_ALIAS || 'eduquest';
const keystorePassword = process.env.KEYSTORE_PASSWORD || 'eduquest2024';
const keystoreAliasPassword = process.env.KEYSTORE_ALIAS_PASSWORD || 'eduquest2024';

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
      keystorePath: keystorePath,
      keystoreAlias: keystoreAlias,
      keystorePassword: keystorePassword,
      keystoreAliasPassword: keystoreAliasPassword,
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

