<template lang="html">
  <div class="columns pager-holder is-centered">
    <div class="column is-4">
      <div class="columns is-centered is-mobile">
        <div class="column is-narrow button-holder">
          <a class="button pagination-previous"
             @click="goBack"
             :disabled="disablePrev">
             <i class="fa fa-angle-left"></i>
          </a>
        </div>
        <div class="column is-hidden-mobile">

        </div>
        <div class="column is-narrow button-holder">
          <a class="button pagination-next"
            @click="goForward"
            :disabled="disableNext">
            <i class="fa fa-angle-right"></i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    disableNext: {
      type: Boolean,
      required: true,
    },
    disablePrev: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    goBack () {
      var self = this;
      if (!self.disablePrev) {
        self.$emit('goBack');
      }
    },
    goForward () {
      var self = this;
      if (!self.disableNext) {
        self.$emit('goForward');
      }
    },
  },
  computed: {

  },
}
</script>

<style scoped lang="css">
  nav {
    margin-top: 10px;
  }
  .pager-holder {
    margin: 0;
  }

  .button-holder {
    display: inline-block;
  }

  .button-spacer {
    display: inline-block;
    margin-left: 0;
    margin-right: auto;
  }

  .pagination-link {
    cursor: default;
    background-color: rgb(255, 255, 255);
    color: #00d1b2;
  }

  .pagination-link:hover {
    cursor: default;
    background-color: rgb(255, 255, 255);
    color: #00d1b2;
  }
</style>
