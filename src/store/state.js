import navbarSearchAndPinList from '@/layouts/components/navbarSearchAndPinList'
import themeConfig from '@/../themeConfig.js'
import colors from '@/../themeConfig.js'

import { getToken } from '@/plugin/auth'

const state = {
  isSidebarActive: true,
  breakpoint: null,
  sidebarWidth: 'default',
  reduceButton: themeConfig.sidebarCollapsed,
  bodyOverlay: false,
  sidebarItemsMin: false,
  theme: themeConfig.theme || 'semi-dark',
  navbarSearchAndPinList: navbarSearchAndPinList,
  activeUser: null,
  accessToken: getToken(),
  // activeUser: {
  //   id: 0,
  //   name: "John Doe",
  //   about:
  //     "Dessert chocolate cake lemon drops jujubes. Biscuit cupcake ice cream bear claw brownie brownie marshmallow.",
  //   img: "avatar-s-11.png",
  //   status: "online"
  // },
  themePrimaryColor: colors.primary,
  starredPages: navbarSearchAndPinList.data.filter(
    page => page.highlightAction
  ),
  userRole: null,
  windowWidth: null
}

export default state
