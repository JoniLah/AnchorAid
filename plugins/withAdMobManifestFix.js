const {withAndroidManifest} = require('@expo/config-plugins');

/**
 * Config plugin to fix AdMob manifest merger conflict
 * Resolves DELAY_APP_MEASUREMENT_INIT meta-data conflict
 */
const withAdMobManifestFix = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const {manifest} = androidManifest;

    if (!manifest.application) {
      return config;
    }

    const application = manifest.application[0];

    // Ensure tools namespace is declared in manifest FIRST
    if (!manifest.$) {
      manifest.$ = {};
    }
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    // Remove ALL existing DELAY_APP_MEASUREMENT_INIT meta-data entries
    if (application['meta-data']) {
      const metaDataArray = application['meta-data'];
      // Filter out any existing DELAY_APP_MEASUREMENT_INIT entries
      application['meta-data'] = metaDataArray.filter(
        (meta) =>
          !meta.$ ||
          meta.$['android:name'] !==
            'com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT',
      );
    } else {
      application['meta-data'] = [];
    }

    // Add the correct meta-data with tools:replace
    application['meta-data'].push({
      $: {
        'android:name': 'com.google.android.gms.ads.DELAY_APP_MEASUREMENT_INIT',
        'android:value': 'false',
        'tools:replace': 'android:value',
      },
    });

    return config;
  });
};

module.exports = withAdMobManifestFix;

