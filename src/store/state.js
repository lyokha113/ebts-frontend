import themeConfig from '@/../themeConfig.js'
import colors from '@/../themeConfig.js'

import { getToken } from '@/plugin/auth'

const state = {
  // ////////////////////////////////////////////
  // APP
  // ////////////////////////////////////////////
  isSidebarActive: true,
  breakpoint: null,
  sidebarWidth: 'default',
  reduceButton: themeConfig.sidebarCollapsed,
  bodyOverlay: false,
  sidebarItemsMin: false,
  theme: themeConfig.theme || 'semi-dark',
  themePrimaryColor: colors.primary,
  windowWidth: null,

  // ////////////////////////////////////////////
  // USER
  // ////////////////////////////////////////////
  activeUser: null,
  accessToken: getToken(),

  // ////////////////////////////////////////////
  // ACCOUNT
  // ////////////////////////////////////////////
  accounts: [],

  // ////////////////////////////////////////////
  // CATEGORY
  // ////////////////////////////////////////////
  categoriesNoTemplate: [],
  categoriesWithTemplates: [],

  // ////////////////////////////////////////////
  // TEMPLATES
  // ////////////////////////////////////////////
  templates: [],
  currentTemplate: null,

  // ////////////////////////////////////////////
  // FILE
  // ////////////////////////////////////////////
  files: [],

  // ////////////////////////////////////////////
  // TUTORIAL
  // ////////////////////////////////////////////
  tutorials: [],

  // ////////////////////////////////////////////
  // PUBLISH
  // ////////////////////////////////////////////
  publishes: [],

  // ////////////////////////////////////////////
  // WORKSPACE
  // ////////////////////////////////////////////
  workspaces: [],

  // ////////////////////////////////////////////
  // RAW TEMPLATE
  // ////////////////////////////////////////////
  currentRaw: null
}

export default state
