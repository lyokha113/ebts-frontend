<template>
  <div class="flex flex-wrap">
    <div id="left-panel">
      <div class="p-4 font-medium text-xl text-white text-center">
        SETTING
      </div>
      <div id="trait-manager">
        <div class="px-4" style="font-size: 10.5px; color: #DDDDDD">
          Data:
        </div>
      </div>
      <div id="selector"></div>
      <div id="style-manager"></div>
    </div>
    <div id="editor"></div>
  </div>
</template>

<script>
import grapesjs from 'grapesjs'
import grapesjsPresetNewsletter from 'grapesjs-preset-newsletter'
import tUIImageEditor from 'grapesjs-tui-image-editor'
import configEditor from '@/components/editor/configEditor.js'
import { mapGetters, mapActions } from 'vuex'

import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs-preset-newsletter/dist/grapesjs-preset-newsletter.css'
export default {
  data() {
    return {
      editor: {},
      uploadPopup: false,
      uploadPercent: 0
    }
  },
  computed: {
    ...mapGetters([
      'accessToken',
      'currentBlock',
      'editorFiles',
      'editorChange',
      'userBlocks'
    ])
  },
  async mounted() {
    if (!this.currentBlock) {
      this.$router.push('/user/block')
      return
    }

    let loader = this.$loading.show({
      color: '#7367f0',
      loader: 'spinner',
      width: 64,
      height: 64,
      backgroundColor: '#ffffff',
      opacity: 1,
      zIndex: 110000
    })

    await Promise.all([
      this.handleCallAPI(this.getEditorFiles, null, false),
      this.handleCallAPI(this.getUserBlocks, null, false)
    ])

    loader.hide()

    this.setEditorChange(false)

    this.editor = grapesjs.init({
      components: this.currentBlock && this.currentBlock.content,
      container: '#editor',
      height: '780px',
      plugins: [
        editor => grapesjsPresetNewsletter(editor, {}),
        editor => configEditor(editor),
        editor =>
          tUIImageEditor(editor, {
            includeUI: {
              useDefaultUI: true,
              initMenu: 'filter'
            },
            icons: {
              'menu.normalIcon.path': require('@/assets/images/editor/icon-d.svg'),
              'menu.activeIcon.path': require('@/assets/images/editor/icon-b.svg'),
              'menu.disabledIcon.path': require('@/assets/images/editor/icon-a.svg'),
              'menu.hoverIcon.path': require('@/assets/images/editor/icon-c.svg'),
              'submenu.normalIcon.path': require('@/assets/images/editor/icon-d.svg'),
              'submenu.activeIcon.path': require('@/assets/images/editor/icon-c.svg')
            },
            onApply: this.handleApplyEditconfirm
          })
      ],
      assetManager: {
        assets: [...this.editorFiles],
        noAssets: `<div class="no-image">You haven't upload any image.</div>`,
        dropzone: false,
        openAssetsOnDrop: false,
        uploadFile: event => {
          var files = event.dataTransfer
            ? event.dataTransfer.files
            : event.target.files
          this.handleUploadFile(files, this.editor.AssetManager)
        },
        handleAdd: () => {}
      },
      storageManager: { type: null },
      richTextEditor: {
        actions: ['bold', 'italic', 'underline', 'strikethrough']
      },
      selectorManager: {
        appendTo: '#selector'
      },
      styleManager: {
        appendTo: '#style-manager'
      },
      traitManager: {
        appendTo: '#trait-manager'
      }
    })

    this.editor.on('change:changesCount', async () => {
      this.setEditorChange(true)
    })

    this.editor.on('load', () => {
      this.editor.Panels.addButton('options', {
        id: 'save',
        label: ' Save',
        className: 'fa fa-upload',
        attributes: { title: 'Save' },
        active: false,
        command: () => this.handleSaveContent()
      })
    })
  },
  methods: {
    ...mapActions([
      'getEditorFiles',
      'createFile',
      'getUserBlocks',
      'updateUserBlockContent',
      'setEditorChange'
    ]),

    getFileNameFromAM(src, assetManager) {
      let files = assetManager.getAll()
      files = [...files.models]
      const file = files.find(f => f.attributes.src == src)
      return file && file.attributes.name
    },

    handleOnUploaddProgress(progressEvent) {
      this.uploadPercent = parseInt(
        Math.round((progressEvent.loaded * 100) / progressEvent.total)
      )
    },

    handleApplyEditconfirm(imageEditor, imageModel) {
      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: 'Do you want to create new image with these changes ?',
        accept: () => {
          const assetManager = this.editor.AssetManager
          const name = this.getFileNameFromAM(
            imageModel.attributes.src,
            assetManager
          )
          const file = this.base64ImageToBlob(imageEditor.toDataURL())
          this.handleApplyEditFile(
            file,
            name,
            imageModel,
            this.editor.AssetManager
          )
        }
      })
    },

    async handleSaveContent() {
      const content = this.editor.runCommand('gjs-get-inlined-html')
      if (!content) {
        this.handleErrorInput(
          'Can not save userblock',
          'Content can not be empty'
        )
        return
      }
      await this.handleCallAPI(this.updateUserBlockContent, {
        id: this.currentBlock.id,
        content
      })
      this.setEditorChange(false)
    },

    async handleApplyEditFile(file, name, imageModel, assetManager) {
      this.uploadPopup = true
      this.uploadPercent = 0

      if (name) {
        const dot = name.lastIndexOf('.')
        name =
          dot != -1
            ? name.substring(0, dot) + '-edited' + name.substring(dot)
            : name + '-edited'
      } else {
        name = 'edited'
      }

      let formData = new FormData()
      formData.append('files', file, name)
      const uploader = {
        file: formData,
        onUploadProgress: this.handleOnUploaddProgress
      }
      const uploaded = await this.handleCallAPI(this.createFile, uploader)
      assetManager.add([...this.editorFiles])
      imageModel.set('src', uploaded[0].link)
      this.uploadPercent = 0
      this.uploadPopup = false
      this.editor.Modal.close()
    },

    async handleUploadFile(files, assetManager) {
      this.uploadPopup = true
      this.uploadPercent = 0
      files = [...files]

      let formData = new FormData()
      files.forEach(file => {
        if (/image.*/.test(file.type)) {
          formData.append('files', file)
        } else {
          this.handleErrorInput(
            'File not supported',
            `Can't upload ${file.name}`
          )
        }
      })

      if (formData.getAll('files').length) {
        const uploader = {
          file: formData,
          onUploadProgress: this.handleOnUploaddProgress
        }
        await this.handleCallAPI(this.createFile, uploader)
        assetManager.add([...this.editorFiles])
        this.uploadPercent = 0
        this.uploadPopup = false
      }
    }
  },
  beforeDestroy() {
    this.uploadPopup = false
  },
  beforeRouteLeave(to, from, next) {
    if (this.editorChange > 0) {
      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: `Your block haven't saved. Do you want to leave it ?`,
        'accept-text': 'Leave',
        cancel: async () => next(false),
        accept: async () => next()
      })
    } else {
      next()
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .gjs-one-bg {
  background-color: #373d49;
}

/deep/ .gjs-pn-buttons.gjs-pn-views {
  justify-content: space-evenly;
}

/deep/ .gjs-am-file-uploader {
  float: unset;
  width: 100%;
  height: 100px;

  form {
    height: 100px;

    #gjs-am-title {
      padding: 0px;
      top: 40%;
    }

    #gjs-am-uploadFile {
      padding: 0px;
      height: 100%;
      cursor: pointer;
    }
  }
}

/deep/ .gjs-am-assets-cont {
  float: unset;
  width: 100%;
  padding-top: 25px;
}

/deep/ .gjs-am-assets-header {
  display: none;
}

/deep/ .gjs-am-assets {
  .gjs-am-asset {
    width: 20%;
    height: 130px;
    border: none;
    margin-bottom: 15px;

    &:hover {
      .gjs-am-close {
        display: none;
      }
    }
    .gjs-am-preview-cont {
      height: 100px;
      width: 100%;
    }

    .gjs-am-meta {
      width: 100%;

      .gjs-am-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .no-image {
    position: relative;
    width: 100%;
    text-align: center;
    top: 40%;
  }
}

/deep/ .gjs-blocks-c {
  .gjs-block[title='Text'] {
    order: 1;
  }
  .gjs-block[title='Link'] {
    order: 2;
  }

  .gjs-block[title='Image'] {
    order: 3;
  }

  .gjs-block[title='Button'] {
    order: 4;
  }

  .gjs-block[title='Divider'] {
    order: 5;
  }
}

/deep/ .gjs-dropzone-active {
  .gjs-dropzone {
    display: none !important;
  }
}

/deep/ .gjs-pn-commands {
  display: flex;
  justify-content: center;
}

/deep/ .gjs-trt-traits {
  padding: 5px;
}

/deep/ .gjs-pn-panel.gjs-pn-views {
  .gjs-pn-buttons {
    justify-content: center;
    .gjs-pn-btn {
      &.fa-bars:before {
        content: 'LAYER';
        font-size: 17px;
        padding: 5px;
      }
      &.fa-th-large:before {
        content: 'BLOCK';
        font-size: 17px;
        padding: 5px;
      }
    }
  }
}
/deep/ .gjs-pn-btn.fa.fa-code {
  display: none;
}
#left-panel {
  width: 13%;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #373d49;
  z-index: 1;
  overflow: scroll;
  max-height: 780px;
  &::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }

  #selector {
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: 5px;
  }
}
#editor {
  width: 87% !important;
}
</style>
