<template>
  <div id="data-list-list-view" class="data-list-container">
    <vs-table
      ref="table"
      pagination
      search
      :max-items="itemsPerPage"
      :data="categoriesWithTemplates"
    >
      <div
        slot="header"
        class="flex flex-wrap-reverse items-center flex-grow justify-between"
      >
        <div class="flex flex-wrap-reverse items-center">
          <div
            class="p-3 mb-4 mr-4 rounded-lg cursor-pointer flex items-center justify-between text-lg font-medium text-base text-primary border border-solid border-primary"
            @click=";(name = ''), (addPrompt = true)"
          >
            <feather-icon icon="PlusIcon" svg-classes="h-4 w-4" />
            <span class="ml-2 text-base text-primary">Create new</span>
          </div>
        </div>

        <!-- ITEMS PER PAGE -->
        <vs-dropdown vs-trigger-click class="cursor-pointer mb-4 mr-4">
          <div
            class="p-4 border border-solid d-theme-border-grey-light rounded-full d-theme-dark-bg cursor-pointer flex items-center justify-between font-medium"
          >
            <span class="mr-2">
              {{ currentPage * itemsPerPage - (itemsPerPage - 1) }} -
              {{
                categoriesWithTemplates.length - currentPage * itemsPerPage > 0
                  ? currentPage * itemsPerPage
                  : categoriesWithTemplates.length
              }}
              of {{ categoriesWithTemplates.length }}
            </span>
            <feather-icon icon="ChevronDownIcon" svg-classes="h-4 w-4" />
          </div>
          <vs-dropdown-menu>
            <vs-dropdown-item @click="itemsPerPage = 10">
              <span>10</span>
            </vs-dropdown-item>
            <vs-dropdown-item @click="itemsPerPage = 20">
              <span>20</span>
            </vs-dropdown-item>
            <vs-dropdown-item @click="itemsPerPage = 50">
              <span>50</span>
            </vs-dropdown-item>
            <vs-dropdown-item @click="itemsPerPage = 100">
              <span>100</span>
            </vs-dropdown-item>
          </vs-dropdown-menu>
        </vs-dropdown>
      </div>

      <template slot="thead">
        <vs-th sort-key="name">Category Name</vs-th>
        <vs-th>Num of Templates</vs-th>
        <vs-th sort-key="active">Status</vs-th>
        <vs-th>Action</vs-th>
      </template>

      <template slot-scope="{ data }">
        <tbody>
          <vs-tr v-for="(tr, indextr) in data" :key="indextr" :data="tr">
            <vs-td style="width: 800px">
              <p class="font-medium">{{ tr.name }}</p>
            </vs-td>

            <vs-td>
              <p>
                {{ tr.templates ? tr.templates.length : 0 }}
              </p>
            </vs-td>

            <vs-td>
              <vs-chip :color="tr.active ? 'success' : 'danger'">
                <vs-avatar :icon="tr.active ? 'done' : 'lock'" />
                {{ tr.active ? 'Active' : 'Locked' }}
              </vs-chip>
            </vs-td>

            <vs-td style="width: 100px">
              <span class="action-icon mr-1" @click.stop="handleStatus(tr)">
                <vs-icon
                  size="small"
                  :icon="tr.active ? 'lock' : 'lock_open'"
                />
              </span>
              <span
                class="action-icon ml-1"
                @click.stop="
                  ;(selected = JSON.parse(JSON.stringify(tr))),
                    (updateName = selected.name),
                    (updateTrending = selected.trending),
                    (updatePrompt = true)
                "
              >
                <vs-icon size="small" icon="create" />
              </span>
            </vs-td>

            <template slot="expand">
              <vs-row>
                <vs-col
                  v-for="template in tr.templates"
                  :key="template.id"
                  vs-type="flex"
                  vs-justify="center"
                  vs-align="center"
                  vs-w="4"
                >
                  <ItemGridView :template="template" />
                </vs-col>
              </vs-row>
            </template>
          </vs-tr>
        </tbody>
      </template>
    </vs-table>

    <vs-popup
      id="create-popup"
      title="CREATE NEW CATEGORY"
      :active.sync="addPrompt"
    >
      <div>
        Enter category name:
        <vs-input
          v-model="name"
          placeholder="Name"
          style="width: 100%"
          class="my-2"
        />
        <vs-button
          color="primary"
          type="filled"
          class="float-right mt-2"
          :disabled="!name"
          @click="handleAdd"
          >Add</vs-button
        >
      </div>
    </vs-popup>

    <vs-popup
      id="update-popup"
      title="UPDATE CATEGORY"
      :active.sync="updatePrompt"
    >
      <div>
        Enter category name to update:
        <vs-input
          v-model="updateName"
          placeholder="Name"
          style="width: 100%"
          class="my-2"
        />
        <vs-button
          color="primary"
          type="filled"
          class="float-right mt-2"
          :disabled="!updateName"
          @click="handleUpdate"
          >Update</vs-button
        >
        <vs-checkbox v-model="updateTrending">Trending</vs-checkbox>
      </div>
    </vs-popup>
  </div>
</template>

<script>
import ItemGridView from '@/components/category/ItemGridView.vue'
import { mapGetters, mapActions } from 'vuex'
export default {
  components: {
    ItemGridView
  },
  data() {
    return {
      selected: null,
      itemsPerPage: 10,
      isMounted: false,
      addPrompt: false,
      name: '',
      updatePrompt: false,
      updateName: '',
      updateTrending: false
    }
  },
  computed: {
    ...mapGetters(['categoriesWithTemplates']),
    currentPage() {
      if (this.isMounted) {
        return this.$refs.table.currentx
      }
      return 0
    }
  },
  methods: {
    ...mapActions([
      'getCategoriesWithTemplates',
      'createCategory',
      'updateCategory'
    ]),
    handleAdd() {
      if (this.name.trim().length < 5 || this.name.trim().length > 30) {
        this.handleErrorInput(
          'Error input value',
          'Name must be 5 - 30 characters'
        )
        return
      }

      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: `Do you want to create new category ?`,
        accept: async () => {
          if (
            await this.handleCallAPI(this.createCategory, {
              name: this.name.trim()
            })
          ) {
            this.addPrompt = false
          }
        }
      })
    },
    handleUpdate() {
      if (
        this.updateName.trim().length < 5 ||
        this.updateName.trim().length > 30
      ) {
        this.handleErrorInput(
          'Error input value',
          'Name must be 5 - 30 characters'
        )
        return
      }

      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: `Do you want to update this category ?`,
        accept: async () => {
          this.selected.name = this.updateName.trim()
          this.selected.trending = this.updateTrending
          if (await this.handleCallAPI(this.updateCategory, this.selected)) {
            this.updatePrompt = false
          }
        }
      })
    },
    handleStatus(category) {
      this.selected = JSON.parse(JSON.stringify(category))
      const actionMsg = category.active ? 'lock' : 'unlock'
      this.$vs.dialog({
        type: 'confirm',
        title: `Confirm`,
        text: `This action could be affect to other parts. Do you want to ${actionMsg} this category ?`,
        accept: () => {
          this.selected.active = !this.selected.active
          this.handleCallAPI(this.updateCategory, this.selected)
        }
      })
    }
  },
  created() {
    this.handleCallAPI(this.getCategoriesWithTemplates)
  },
  mounted() {
    this.isMounted = true
  },
  destroyed() {
    this.addPrompt = false
    this.updatePrompt = false
  }
}
</script>

<style lang="scss" scoped>
/deep/ .vs-popup {
  width: 300px;
}

.action-icon:hover {
  color: mediumslateblue;
}

#create-popup {
  z-index: 51100;
}

#update-popup {
  z-index: 51100;
}
</style>
