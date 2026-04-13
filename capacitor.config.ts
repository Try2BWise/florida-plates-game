import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gorillagrin.everypl8',
  appName: 'Every PL8',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      // Hide manually from JS so we can wait for storage/network init
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      iosSpinnerStyle: 'small',
      showSpinner: false,
    },
  },
};

export default config;
