<template>
  <div class="tabs is-toggle is-fullwidth">
    <ul id="updateTabs">
      <li class='tab' v-for="element in tabs" :id="element.id" :class="{'is-active' : active == element.id}" :title="element.title">
        <a @click.prevent="onClick(element.id, element.target)">
          <span class="icon is-small no-margins">
            <i :class="['fa', element.icon ]" class="no-margins"></i>
          </span>
          <span class="is-hidden-mobile margin-left-5">{{ element.name }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    active: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      required: false,
    },
  },
  methods: {
    onClick(id) {
      this.$emit('tab-click', id);
    }
  },
  computed: {

  },
}
</script>

<style>
  .tabs.is-toggle a {
    color: #fffee7;
    outline: none;
  }
  .tabs.is-toggle a:hover {
    border-color: #ffba00;
    background-color: rgba(48, 44, 47, .8);
  }
  .tabs.is-toggle li.is-active a {
    border-color: #ffe700;
    background-color: rgba(0,0,0,0);
    color: #00e2c6;
    z-index: 1;
  }
  .tabs:not(:last-child) {
    margin-bottom: .3rem;
  }
  #updateTabs li:not(:last-child) {
    width: 40%;
  }
  .tab {
    position:relative;
  }
  .no-margins {
    margin-right: 0 !important;
  }

  .margin-left-5{
    margin-left: 5px;
  }
</style>
