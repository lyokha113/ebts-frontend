const getters = {
  // APP
  sidebarWidth: state => state.sidebarWidth,

  // USER
  accessToken: state => state.accessToken,
  activeUser: state => state.activeUser,
  permission: state => state.activeUser && state.activeUser.roleId,

  // ACCOUNT
  accounts: state => state.accounts,

  // CATEGORY
  categoriesNoTemplate: state => state.categoriesNoTemplate,
  categoriesWithTemplates: state => state.categoriesWithTemplates,

  // TEMPLATES
  templates: state => state.templates,
  currentTemplate: state => state.currentTemplate,

  // FILE
  files: state => state.files,
  editorFiles: state =>
    state.files
      .filter(f => f.active)
      .map(f => {
        return {
          id: f.id,
          name: f.name,
          src: f.link,
          type: 'image'
        }
      }),

  // TUTORIAL
  tutorials: state => state.tutorials,

  // PUBLISH
  publishes: state => state.publishes,

  // WORKSPACE
  workspaces: state => state.workspaces,

  // RAW TEMPLATE
  currentRaw: state => state.currentRaw
}

export default getters
