<template lang="html">
  <div class="container notif-holder">
    <notification v-for="(message, index) in messages"
                  :index="index"
                  :key="index"
                  :message="message.message"
                  :messageColor="message.type"
                  @close="close"></notification>
  </div>
</template>

<script>
  import Notification from '@/components/Notification'
  export default {
    data() {
      return {

      }
    },
    components: {
      Notification,
    },
    props: {
      messages: {
        type: Array,
        required: true,
      }
    },
    methods: {
      close(index) {
        this.$emit('close', index);
      }
    },
  }
</script>

<style lang="css" scoped>
  .notif-holder {
    padding-bottom: 10px;
  }
</style>
