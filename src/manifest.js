import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json' with { type: 'json' }

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-32.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  options_page: 'options.html',
  devtools_page: 'devtools.html',
  background: {
    service_worker: 'src/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.js'],
    },
    {
      // NOTE: Chrome MV3 match patterns must end with `*`, not `**`.
      matches: [
        'https://leetcode.com/*',
        'https://*.leetcode.com/*',
        'http://leetcode.com/*',
        'http://*.leetcode.com/*',
        'https://geeksforgeeks.org/*',
        'https://www.geeksforgeeks.org/*',
        'https://practice.geeksforgeeks.org/*',
        'https://*.geeksforgeeks.org/*',
        'http://naukri.com/code360/*',
        'http://*.naukri.com/code360/*',
        'https://*.naukri.com/code360/*',
        'http://www.naukri.com/code360/*',
        'https://www.naukri.com/code360/*',
      ],
      js: ['src/contentScript/askAiHelper.js'],
    },
  ],
  side_panel: {
    default_path: 'sidepanel.html',
  },
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-32.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['sidePanel', 'storage', 'tabs', 'scripting', 'activeTab'],

  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
})
