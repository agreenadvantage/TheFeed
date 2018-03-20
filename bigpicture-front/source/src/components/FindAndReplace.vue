<template lang="html">
  <div class="dropdownContainer box default-cursor" v-show="isActive" :class="{'mobile': isMobile}">
    <div class="field">
      <label class="label" for="find">Find:</label>
      <type-ahead name="find"
                  :icon="icon"
                  :options="tags"
                  :limit="limit"
                  :inputClasses="'is-expanded'"
                  @select="chooseFind">
      </type-ahead>
      <type-ahead-handler :display="find"
                          @remove="removeFind">
      </type-ahead-handler>
    </div>
    <div class="field">
      <label class="label" for="replace">Replace:</label>
      <type-ahead name="replace"
                  :icon="icon"
                  :options="tags"
                  :limit="limit"
                  :inputClasses="'is-expanded'"
                  @select="chooseReplace">
      </type-ahead>
      <type-ahead-handler :display="replace"
                          @remove="removeReplace">
      </type-ahead-handler>
    </div>
    <div class="columns">
      <div class="column">
        <button class="right-side button submit"
             @click="submit"
             :disabled="submitIsBlocked"
             :title="submitMessage">
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
        limit: 5,
        icon: 'fa-tags',
      }
    },
    props: {
      tags: {
        type: Array,
        required: true,
      },
      find:{
        type: Array,
        required: true,
      },
      replace: {
        type: Array,
        required: true,
      },
      isActive: {
        type: Boolean,
        required: true,
      },
      isMobile: {
        type: Boolean,
        required: true,
      },
    },
    methods: {
      submit() {
        this.$emit('submit');
      },
      chooseFind(tag) {
        if (tag.length >= 3) {
          this.$emit('chooseFind', tag);
        }
      },
      removeFind() {
        this.$emit('removeFind');
      },
      chooseReplace(tag) {
        if (tag.length >= 3) {
          this.$emit('chooseReplace', tag);
        }
      },
      removeReplace() {
        this.$emit('removeReplace');
      },
    },
    computed: {
      submitIsBlocked() {
        if (this.find.length === 1 && this.replace.length === 1) {
          return false;
        }else {
          return true;
        }
      },
      submitMessage() {
        if (this.submitIsBlocked) {
          return 'You gotta have both find and replace to use this tool!'
        }else {
          return ''
        }
      }
    },
    components: {
      TypeAhead,
      TypeAheadHandler,
    },
  }
</script>

<style lang="css" scoped>
  .mobile {
    top: 182px;
  }
</style>
