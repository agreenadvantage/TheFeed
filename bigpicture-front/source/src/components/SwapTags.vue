<template lang="html">
  <div class="editTags">
    <hr />
    <div class="field">
      <div class="control">
        <type-ahead :icon="faTags"
                    :options="allTags"
                    :limit="limit"
                    @select="addTag"
                    v-model="keyword">
        </type-ahead>
      </div>
    </div>
    <div class="columns">
      <div class="field column">
        <div class="control">
          <type-ahead-handler :display="newTags"
                              @remove="remove"
                              class="tagHolder">
          </type-ahead-handler>
        </div>
      </div>
      <div class="field column is-narrow">
        <div class="control">
          <button class="button submit"
                  @click="submitNewTags"
                  :disabled="!hasTags">
                    <i class="fa fa-check"></i>
          </button>
        </div>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import TypeAhead from '@/components/TypeAhead'
import TypeAheadHandler from '@/components/TypeAheadHandler'
import cloneDeep from 'lodash.clonedeep'

export default {
  data() {
    return {
      newTags: [],
      limit: 5,
      keyword: '',
      faTags: 'fa-tags',
      classes: '',
    }
  },
  components: {
    TypeAhead,
    TypeAheadHandler,
  },
  props: {
    postTags: {
      type: Array,
      required: true,
    },
    allTags: {
      type: Array,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  methods: {
    saveNewTags() {
      this.$emit('saveNewTags', this.newTags);
    },
    addTag(tag) {
      let index = this.newTags.indexOf(tag);
      if (index == -1) {
        this.newTags.push(tag);
      }else {

      }
    },
    remove(idx) {
      this.newTags.splice(idx, 1);
    },
    submitNewTags() {
      if (this.hasTags) {
        this.$emit('submitNewTags', this.newTags);
      }else {
        this.newTags = this.postTags;
        this.$emit('insertMessage', { message: 'You can\'t save without any tags YA FLAPJACK!', type: 'is-warning' });
      }
    }
  },
  mounted() {
    this.newTags = cloneDeep(this.postTags);
  },
  computed: {
    hasTags() {
      return this.newTags.length >= 1;
    },
  }
}
</script>

<style lang="css" scoped>
  .editTags {
    padding: 5px 15px;
    overflow-y: hidden;
    overflow-x: hidden;
  }
  .tagHolder {
    display: block;
  }
</style>
