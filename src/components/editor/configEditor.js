import color from '@/components/editor/color.json'
import font from '@/components/editor/font.json'

function rgbToHex(rgb) {
  return (
    '#' +
    rgb
      .substring(4, rgb.length - 1)
      .split(',')
      .map(str =>
        parseInt(str, 10)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

export default function(editor) {
  const panelManager = editor.Panels
  const blockManager = editor.BlockManager
  const commands = editor.Commands
  const domComponents = editor.DomComponents
  const rte = editor.RichTextEditor

  const sectionBlocksIds = ['sect100', 'sect50', 'sect30', 'sect37']
  const listBlocksIds = ['text-sect', 'grid-items', 'list-items']
  const basicBlocksIds = [
    'button',
    'text',
    'divider',
    'image',
    'quote',
    'link',
    'link-block'
  ]

  const setDefaultBlocks = () => {
    blockManager.remove('grid-items')
    blockManager.remove('list-items')

    const textBlock = blockManager.get('text')
    textBlock.set('label', 'Paragraph')
    textBlock.set('attributes', { class: 'fa fa-paragraph' })
  }

  const setBlockCategories = () => {
    blockManager.getAll().forEach(b => {
      if (sectionBlocksIds.includes(b.id)) b.set('category', 'Section')
      if (listBlocksIds.includes(b.id)) b.set('category', 'List Section')
      if (basicBlocksIds.includes(b.id)) b.set('category', 'Basic')
    })
  }

  const addDynamicTypes = () => {
    domComponents.addType('dynamic text', {
      isComponent: el => {
        el instanceof HTMLElement &&
          el.getAttribute('datatype') === 'dynamic text'
      },
      model: {
        defaults: {
          traits: [
            { name: 'name', placeholder: 'Field name' },
            { name: 'text', placeholder: 'Default text' }
          ],
          attributes: { dataType: 'dynamic text' }
        },
        init() {
          this.on('change:attributes:text', this.handleTextChange)
        },

        handleTextChange() {
          const text = this.getAttributes().text
          editor.getSelected().set('content', text)
        }
      }
    })

    domComponents.addType('dynamic link', {
      isComponent: el => {
        el instanceof HTMLElement &&
          el.getAttribute('datatype') === 'dynamic link'
      },
      model: {
        defaults: {
          tagName: 'a',
          traits: [
            { name: 'name', placeholder: 'Field name' },
            { name: 'text', placeholder: 'Text to show' },
            { name: 'href', placeholder: 'Default link' },
            {
              type: 'select',
              name: 'target',
              options: [
                { name: 'New windows', value: '_blank' },
                { name: 'This window', value: '_top' }
              ]
            }
          ],
          attributes: {
            dataType: 'dynamic link',
            href: 'about:blank',
            target: '_blank'
          }
        },
        init() {
          this.on('change:attributes:text', this.handleTextChange)
        },

        handleTextChange() {
          const text = this.getAttributes().text
          editor.getSelected().set('content', text)
        }
      }
    })
  }

  const addBlocks = () => {
    blockManager.add('dynamic text', {
      label: 'Dynamic Text',
      category: 'Dynamic Content',
      attributes: { class: 'gjs-fonts gjs-f-text' },
      content: {
        type: 'dynamic text',
        content: 'Dynamic Text',
        style: { color: 'lightgrey', padding: '10px' }
      }
    })

    blockManager.add('dynamic link', {
      label: 'Dynamic Link',
      category: 'Dynamic Content',
      attributes: { class: 'fa fa-link' },
      content: {
        type: 'dynamic link',
        content: 'Dynamic Link',
        style: { color: '#3b97e3', padding: '5px' }
      }
    })

    let gridItem = `
    <table class="grid-item-card">
      <tr>
        <td class="grid-item-card-cell">
          <img class="grid-item-image" src="https://firebasestorage.googleapis.com/v0/b/etbs-441a1.appspot.com/o/default%2F250x150.png?alt=media&token=d0729b42-ce9d-46a3-be05-f16c9773e58d" alt="Image"/>
          <table class="grid-item-card-body">
            <tr>
              <td class="grid-item-card-content">
                <h1 class="card-title">Title here</h1>
                <p class="card-text">Card item content here</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
    blockManager.add('grid-items', {
      label: 'Grid Items',
      category: 'List Section',
      content: `
      <table class="grid-item-row">
        <tr>
          <td class="grid-item">${gridItem}</td>
          <td class="grid-item">${gridItem}</td>
          <td class="grid-item">${gridItem}</td>
        </tr>
     </table>`,
      attributes: { class: 'fa fa-th' }
    })

    let listItem = `
    <table class="list-item">
      <tr>
        <td class="list-item-cell">
          <table class="list-item-content">
            <tr class="list-item-row">
              <td class="list-cell-left">
                <img class="list-item-image" src="https://firebasestorage.googleapis.com/v0/b/etbs-441a1.appspot.com/o/default%2F150x150.png?alt=media&token=cff3bdca-5273-4f58-87a2-af7e175de7c8" alt="Image"/>
              </td>
              <td class="list-cell-right">
                <h1 class="card-title">Title here</h1>
                <p class="card-text">Some description card content item should be here.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
    blockManager.add('list-items', {
      label: 'List Items',
      category: 'List Section',
      content: listItem + listItem + listItem,
      attributes: { class: 'fa fa-th-list' }
    })

    let productItem = `
    <div class="card" style="height:300px;width:300px;margin-bottom:30px;font-weight:100;box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.2);border-radius:2px;overflow:hidden;">
      <div class="card-header" style="height:155px;background-image:url('https://firebasestorage.googleapis.com/v0/b/etbs-441a1.appspot.com/o/default%2F350x150.png?alt=media&token=485e296d-fe1e-4d40-93c4-236aa63df81a');background-size:cover;background-position:center center;"></div>
      <div class="card-body" style="padding:15px 15px 5px 15px;color:#555;">
        <div class="card-title" style="font-size:1.4em;margin-bottom:5px;">Title</div>
        <div class="card-sub-title" style="color:#b3b3b3;font-size:1em;margin-bottom:15px;">Subtitle</div>
        <div class="card-desc" style="font-size:0.85rem;line-height:17px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore</div>
      </div>
    </div>`
    blockManager.add('prodcut-item', {
      label: 'Product Item',
      category: 'List Section',
      content: productItem,
      attributes: { class: 'fa fa-th-list' }
    })
  }

  const addCommands = () => {
    commands.add('open-assets', {
      run(editor, sender, opts = {}) {
        opts.target.set(
          'src',
          'https://firebasestorage.googleapis.com/v0/b/etbs-441a1.appspot.com/o/default%2Fimage_block.png?alt=media&token=e9e4a4f7-449b-495d-9d52-196969774003'
        )
        const modal = editor.Modal
        const am = editor.AssetManager
        const config = am.getConfig()
        const amContainer = am.getContainer()
        const title =
          opts.modalTitle || editor.t('assetManager.modalTitle') || ''
        const types = opts.types
        const accept = opts.accept

        am.setTarget(opts.target)
        am.onClick(opts.onClick)
        am.onDblClick(opts.onDblClick)
        am.onSelect(opts.onSelect)

        if (!this.rendered || types) {
          let assets = am.getAll()

          if (types && types.length) {
            assets = assets.filter(a => types.indexOf(a.get('type')) !== -1)
          }

          am.render(assets)
          this.rendered = 1
        }

        if (accept) {
          const uploadEl = amContainer.querySelector(
            `input#${config.stylePrefix}uploadFile`
          )
          uploadEl && uploadEl.setAttribute('accept', accept)
        }

        modal
          .open({
            title,
            content: amContainer
          })
          .getModel()
          .once('change:open', () => editor.stopCommand(this.id))
        return this
      },

      stop(editor) {
        editor.Modal.close()
        return this
      }
    })
  }

  const addRTE = () => {
    rte.add('indent', {
      icon: '&#8594;',
      attributes: { title: 'Indent' },
      result: rte => rte.exec('indent')
    })

    rte.add('outdent', {
      icon: '&#8592;',
      attributes: { title: 'Outdent' },
      result: rte => rte.exec('outdent')
    })

    rte.add('orderedList', {
      icon: '1.',
      attributes: { title: 'Ordered List' },
      result: rte => rte.exec('insertOrderedList')
    })

    rte.add('unorderedList', {
      icon: '&#8226;',
      attributes: { title: 'Unordered List' },
      result: rte => rte.exec('insertUnorderedList')
    })

    let backColorOpts = color.map(
      c =>
        `<option style="background-color: ${c.hex}" value="${c.hex}">${c.name}</option>`
    )
    let backColor = '<select class="gjs-field"' + backColorOpts + '</select>'
    rte.add('backColor', {
      icon: backColor,
      attributes: { title: 'Background Color' },
      event: 'change',
      result: (rte, action) =>
        rte.exec('backColor', action.btn.firstChild.value),
      update: (rte, action) => {
        const value = rte.doc.queryCommandValue(action.name)
        if (value != 'false') {
          action.btn.firstChild.value = rgbToHex(value)
          action.btn.firstChild.style.backgroundColor = value
        }
      }
    })

    let foreColorOpts = color.map(
      c => `<option style="color: ${c.hex}" value="${c.hex}">${c.name}</option>`
    )
    let foreColor = '<select class="gjs-field">' + foreColorOpts + '</select>'
    rte.add('foreColor', {
      icon: foreColor,
      attributes: { title: 'Color' },
      event: 'change',
      result: (rte, action) =>
        rte.exec('foreColor', action.btn.firstChild.value),
      update: (rte, action) => {
        const value = rte.doc.queryCommandValue(action.name)
        if (value != 'false') {
          action.btn.firstChild.value = rgbToHex(value)
          action.btn.firstChild.style.color = value
        }
      }
    })

    let fontOpts = font.map(
      f => `<option style="font-family: ${f}">${f}</option>`
    )
    let fontName =
      '<select class="gjs-field" style="color: whitesmoke; background-color: #373d49">' +
      fontOpts +
      '</select>'
    rte.add('fontName', {
      icon: fontName,
      attributes: { title: 'Font Name' },
      event: 'change',
      result: (rte, action) =>
        rte.exec('fontName', action.btn.firstChild.value),
      update: (rte, action) => {
        const value = rte.doc.queryCommandValue(action.name)
        if (value != 'false') {
          action.btn.firstChild.value = value.replace(/"/g, '')
        }
      }
    })

    rte.add('fontSize', {
      icon: `<select class="gjs-field" style="color: whitesmoke; background-color: #373d49">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
          </select>`,
      attributes: { title: 'Size' },
      event: 'change',
      result: (rte, action) =>
        rte.exec('fontSize', action.btn.firstChild.value),
      update: (rte, action) => {
        const value = rte.doc.queryCommandValue(action.name)
        if (value != 'false') {
          action.btn.firstChild.value = value
        }
      }
    })
  }

  const addButtons = () => {
    panelManager.addButton('options', {
      id: 'myNewButton',
      className: 'someClass',
      attributes: { title: 'Export' },
      active: false,
      command: () => {
        console.log(editor.store())
      }
    })
  }

  setDefaultBlocks()
  setBlockCategories()
  addDynamicTypes()
  addBlocks()
  addCommands()
  addRTE()
  addButtons()
}