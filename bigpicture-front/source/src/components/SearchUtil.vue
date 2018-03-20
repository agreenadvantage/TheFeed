<!-- NOTE: Dropdown dropdown drop down example (searchable note) -->
<template lang="html">
  <div class='dropdownContainer box default-cursor' :class="{'searchMobile': isMobile}" v-show="isActive">
    <div class="field">
      <label class="label" for="tags">Tags</label>
      <type-ahead :icon="faTags"
                  :options="tags"
                  name="tags"
                  :limit="limit"
                  :inputClasses="'is-expanded'"
                  @select="addTag"
                  v-model="tag">
      </type-ahead>
      <type-ahead-handler :display="searchTags"
                          @remove="removeTag">
      </type-ahead-handler>
    </div>
    <div class="field">
      <label class="label" for="author">Author</label>
      <type-ahead name="author"
                  :icon="faUser"
                  :options="authors"
                  :limit="limit"
                  :inputClasses="'is-expanded'"
                  @select="chooseAuthor"
                  v-model="author">
      </type-ahead>
      <type-ahead-handler :display="searchAuthor"
                          @remove="removeAuthor">
      </type-ahead-handler>
    </div>
    <div class="field">
      <div class="control">
        <label class="label">After </label>
        <input class="input"
               type="date"
               v-model="after"
               @input="chooseAfterDate"/>
      </div>
      <div class="control">
        <label class="label">Before </label>
        <input class="input"
               type="date"
               v-model="before"
               @input="chooseBeforeDate"/>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <button class="button submit right-side"
             @click="submitSearch">
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import TypeAhead from '@/components/TypeAhead'
  import TypeAheadHandler from '@/components/TypeAheadHandler'

  export default {
    data() {
      return {
        dateRange: '',
        author: '',
        tag: '',
        faTags: 'fa-tags',
        faUser: 'fa-user',
        limit: 10,
        before: '',
        after: '',
      }
    },
    components: {
      TypeAhead,
      TypeAheadHandler,
    },
    props: {
      isMobile: {
        type: Boolean,
        required: true,
      },
      isActive: {
        type: Boolean,
        required: true,
      },
      icon: {
        type: String,
        required: false,
        default: 'fa-search',
      },
      authors: {
        type: Array,
        required: false,
      },
      tags: {
        type: Array,
        required: false,
      },
      searchTags: {
        type: Array,
        required: true,
      },
      searchAuthor: {
        type: Array,
        required: true,
      },
      searchDateAfter: {
        type: String,
        required: true,
      },
      searchDateBefore: {
        type: String,
        required: true,
      },
    },
    methods: {
      setActiveTab(tabId) {
        this.$emit('setActiveTab', tabId);
      },
      submitSearch() {
        this.$emit('submitSearch');
        this.setActiveTab('searchResults');
        this.before = '';
        this.after = '';
      },
      changeActive() {
        this.$emit('changeActive');
      },
      chooseAfterDate() {
        this.$emit('chooseAfterDate', this.after);
      },
      chooseBeforeDate() {
        this.$emit('chooseBeforeDate', this.before);
      },
      removeTag(idx) {
        this.$emit('removeSearchTag', idx);
      },
      removeAuthor() {
        this.$emit('removeAuthor')
      },
      addTag(tag) {
        var self = this;
        var idx = self.searchTags.indexOf(tag);
        if (idx == -1) {
          this.$emit('addSearchTag', tag)
        }else {

        }
      },
      chooseAuthor(author) {
        this.$emit('chooseAuthor', author);
      },
    },
    computed: {
      choosenAuthor() {
        let authorArray = [];
        if (this.searchAuthor) {
          authorArray.push(this.searchAuthor);
        }
        return authorArray;
      },
    },
  }
</script>

<style lang="css">
  .default-cursor {
    cursor: default;
  }

  .m-8 {
    margin: 8px;
  }

  .searchMobile {
    top: 121px;
  }


</style>
