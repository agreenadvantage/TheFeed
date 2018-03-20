<template lang="html">
  <button class='button tool'
          :title="name"
          :disabled="disabled"
          @click="handleButtonInput">
    <i class="fa-fw fa" :class="icon"></i>
  </button>
</template>

<script>
export default {
  methods: {
    handleButtonInput() {
      this.$emit('handleButtonInput', this.index);
    },
  },
  props: {
    disabled: {
      type: Boolean,
    },
    index: {
      type: Number,
    },
    name: {
      type: String,
    },
    icon: {
      type: String,
    },
  }
}
</script>

<style lang="css">
  .tool {
    margin-left: 3px;
    margin-bottom: 3px;
  }
</style>
