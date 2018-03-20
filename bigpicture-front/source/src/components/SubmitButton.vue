<template>
  <div class="control">
    <button @click="submit" class="button submit" :disabled="status" :class="{'is-loading': loading == true }" :title="tooltip"><span v-if="!loading"><i class="fa fa-paper-plane"></i></span><span v-if="loading"><i class="fa fa-spinner fa-spin"></i></span></button>
  </div>
</template>

<script>
  export default {
    props: {
      status: {
        type: Boolean,
        required: false,
        default: false,
      },
      tooltip: {
        type: String,
        required: false,
        default: "submit"
      },
      loading: {
        type: Boolean,
        required: false,
        default: false,
      }
    },
    methods: {
      submit () {
        this.$emit('submit');
      }
    },
  }
</script>

<style>

</style>
