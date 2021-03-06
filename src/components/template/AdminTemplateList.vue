<template>
  <vx-card class="grid-view-item mb-base overflow-hidden">
    <template slot="no-body">
      <div
        class="item-img-container shadow-md bg-white h-64 flex items-center justify-center my-3 mx-3"
      >
        <img
          :src="template.thumbnail"
          :alt="template.name"
          class="grid-view-img"
        />
      </div>
      <vs-divider border-style="dashed" class="my-3" />

      <vs-row class="px-3 mb-1">
        <vs-col vs-type="flex" vs-align="center" vs-w="12">
          <span class="truncate font-semibold text-lg">
            <feather-icon icon="FileIcon" svg-classes="h-4 w-4" />
            {{ template.name }}
          </span>
        </vs-col>
      </vs-row>
      <vs-row class="px-3 mb-2">
        <vs-col vs-type="flex" vs-align="center" vs-w="8">
          <vs-avatar
            class="avatar-thumb shadow-md"
            :src="template.authorAvatar"
          />
          <span class="truncate"> {{ template.authorName }}</span>
        </vs-col>
        <vs-col vs-type="flex" vs-align="center" vs-justify="center" vs-w="4">
          <div class="bg-success flex text-white py-1 px-2 pr-2 mr-1 rounded">
            <span class="text-sm mr-2">{{ template.upVote }}</span>
            <feather-icon icon="ChevronUpIcon" svg-classes="h-4 w-4" />
          </div>
          <div class="bg-danger flex text-white py-1 px-2 pl-2 ml-1 rounded">
            <span class="text-sm mr-2">{{ template.downVote }}</span>
            <feather-icon icon="ChevronDownIcon" svg-classes="h-4 w-4" />
          </div>
        </vs-col>
      </vs-row>
      <vs-row class="px-3 pb-2">
        <vs-col class="template_category" vs-align="center">
          <span
            v-for="item in template.categories"
            :key="item.id"
            class="m-1"
            color="#24c1a0"
            >{{ item.name }}</span
          >
        </vs-col>
      </vs-row>

      <div class="px-3">
        <div class="my-4">
          <vs-row class="my-2">
            <vs-col
              vs-type="flex"
              vs-align="center"
              vs-justify="center"
              vs-w="12"
            >
              <vs-button
                class="mx-2"
                type="gradient"
                icon="search"
                radius
                @click="handlePreview(template.id)"
              />
              <vs-button
                class="mx-2"
                type="gradient"
                icon="edit"
                radius
                @click="handleUpdatePopup(template)"
              />
              <vs-button
                class="mx-2"
                type="gradient"
                icon="delete"
                color="danger"
                radius
                @click="handleDelete(template.id)"
              />
            </vs-col>
          </vs-row>
        </div>
      </div>
      <CustomPopup
        id="update-popup"
        title="UPDATE TEMPLATE"
        :active.sync="popup"
      >
        <div>
          Enter name:
          <vs-input
            v-model="name"
            placeholder="Name"
            style="width: 100%"
            class="mt-1 mb-4"
          />
          Enter description:
          <vs-textarea v-model="description" width="100%" class="mt-1 mb-5" />
          Enter workspaces:
          <multiselect
            v-model="categories"
            track-by="id"
            label="name"
            selectLabel=""
            selectedLabel=""
            deselectLabel=""
            group-values="categories"
            group-label="group"
            :options="categoriesNoTemplateSelect"
            :multiple="true"
            :close-on-select="false"
            :searchable="false"
          >
          </multiselect>
          <vs-button
            color="primary"
            type="filled"
            class="float-right mt-5"
            :disabled="!name || !description || !categories.length"
            @click="handleUpdate"
            >Update</vs-button
          >
        </div>
      </CustomPopup>
    </template>
  </vx-card>
</template>

<script>
import CustomPopup from '@/components/CustomPopup.vue'
import { mapActions, mapGetters } from 'vuex'
export default {
  components: {
    CustomPopup
  },
  props: {
    template: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      id: '',
      name: '',
      description: '',
      categories: [],
      popup: false
    }
  },
  computed: {
    ...mapGetters(['currentTemplate', 'categoriesNoTemplate']),
    categoriesNoTemplateSelect() {
      const active = this.categoriesNoTemplate.filter(c => c.active)
      const locked = this.categoriesNoTemplate.filter(c => !c.active)
      return [
        { group: 'Active', categories: active },
        { group: 'Locked', categories: locked }
      ]
    }
  },
  methods: {
    ...mapActions(['getTemplate', 'deleteTemplate', 'updateTemplate']),
    async handlePreview(id) {
      if (this.currentTemplate == null || this.currentTemplate.id != id) {
        await this.handleCallAPI(this.getTemplate, id)
      }
      const preview = window.open('', '_blank')
      preview.document.write(this.currentTemplate.content)
    },
    async handleDelete(id) {
      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: `This action can't be undo. Do you want to delete this template ?`,
        accept: () => this.handleCallAPI(this.deleteTemplate, id)
      })
    },
    handleUpdatePopup(template) {
      this.id = template.id
      this.name = template.name.trim()
      this.description = template.description.trim()
      this.categories = template.categories
      this.popup = true
    },
    async handleUpdate() {
      let isError = false
      if (this.name.trim().length < 5 || this.name.trim().length > 30) {
        this.handleErrorInput(
          'Error input value',
          'Name must be 5 - 30 characters'
        )
        isError = true
      }

      if (
        this.description.trim().length < 5 ||
        this.description.trim().length > 300
      ) {
        this.handleErrorInput(
          'Error input value',
          'Description must be 5 - 300 characters'
        )
        isError = true
      }

      if (!this.categories.length) {
        this.handleErrorInput('Empty value', 'Category must be selected')
        isError = true
      }

      if (isError) {
        return
      }

      const template = {
        id: this.id,
        name: this.name.trim(),
        description: this.description.trim(),
        categoryIds: this.categories.map(c => c.id),
        active: true
      }

      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: `Do you want to update this template ?`,
        accept: async () => {
          if (await this.handleCallAPI(this.updateTemplate, template)) {
            this.popup = false
          }
        }
      })
    }
  },
  destroyed() {
    this.popup = false
  }
}
</script>

<style lang="scss" scoped>
.grid-view-item {
  .grid-view-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    transition: 0.35s;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 4px 25px 0px rgba(0, 0, 0, 0.25);

    .grid-view-img {
      opacity: 0.9;
    }
  }
}

/deep/ .vs-popup {
  width: 500px;
}

#update-popup {
  z-index: 51100;
}

.con-vs-avatar.avatar-thumb {
  background: none !important;
  margin-left: 0px;
}

.template_category {
  display: flex;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  top: 0;
  left: 0;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 77px;
    height: 25px;
    background-image: linear-gradient(90deg, hsla(0, 0%, 100%, 0), #fff);
  }

  span {
    border-radius: 4px;
    border: 1px solid #5952c1;
    font-family: Montserrat;
    font-size: 9px;
    font-weight: 800;
    color: #5952c1;
    display: inline-block;
    padding: 2px 4px;
    text-transform: uppercase;
    white-space: nowrap;
  }
}
</style>
