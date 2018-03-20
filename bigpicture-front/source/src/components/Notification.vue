<template lang="html">
  <div class="notification" :class="messageColor">
    <button class="delete" @click="close"></button>
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageColor: {
      type: String,
      required: false,
      default: 'is-warning',
    },
  },
  methods: {
    close() {
      this.$emit('close', this.index)
    },
  }
}
</script>

<style lang="css">
</style>
