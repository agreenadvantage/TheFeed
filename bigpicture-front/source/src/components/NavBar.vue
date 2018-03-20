<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <div class="navbar-item" href="#">
        <img :src="image" alt="Butterscotch Shenanigans" width="32" height="32">
      </div>

      <div class="navbar-burger burger" data-target="feedOptions">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="navbar-menu" id="feedOptions">
      <div class="navbar-end">
        <!--<a class="navbar-item"-->
        <!--:class="{'navbar-mobile': isMobile}"-->
        <!--href="#"-->
        <!--@click="toggleSearch"-->
        <!--title="Search for Updates">-->
          <!--<div class="column btn-wrap">-->
            <!--<i class="right-side fa fa-search"></i>-->
          <!--</div>-->
        <!--</a>-->
        <a class="navbar-item"
        :class="{'navbar-mobile': isMobile}"
        href="#"
        @click="toggleFindReplace"
        title="Find and Replace">
          <div class="column btn-wrap">
            <i class="right-side fa fa-random" href="#"></i>
          </div>
        </a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdOUbFw7loHL9npXMIRi2S2jgmZLj_jkDxu2RrBV3QEN_ROGg/viewform?usp=sf_link"
           target="_blank"
           class="navbar-item"
           :class="{'navbar-mobile': isMobile}"
           title="Shenanifeed-Feedback/Feature Requests/Bug Reports">
          <div class="column btn-wrap">
            <i class="right-side fa fa-commenting"></i>
          </div>
        </a>
        <a class="navbar-item"
           :class="{'navbar-mobile': isMobile}"
           href="/logout">
          <div class="column btn-wrap">
            <i class="right-side fa fa-sign-out" aria-hidden="true"></i>
          </div>
        </a>
      </div>
    </div>

    <div class="clickCatcher" v-show="dropdownIsOpen" @click="deactivateDropdowns"></div>
    <find-and-replace :isActive="findReplaceIsActive"
                      :isMobile="isMobile"
                      :tags="tags"
                      :find="find"
                      :replace="replace"
                      @chooseFind="chooseFind"
                      @removeFind="removeFind"
                      @chooseReplace="chooseReplace"
                      @removeReplace="removeReplace"
                      @submit="submitFindReplace">
    </find-and-replace>
  </nav>
</template>

<script>
  import FindAndReplace from '@/components/FindAndReplace'
  import image from '../assets/icon_bs.png'

  export default {
    props: {
      find: {
        type: Array,
        required: true,
      },
      replace: {
        type: Array,
        required: true,
      },
      viewPortWidth: {
        type: Number,
        required: true,
      },
      findReplaceIsActive: {
        type: Boolean,
        required: true,
      },
      tags: {
        type: Array,
        required: false
      },
    },
    data () {
      return {
        image: image,
      }
    },
    methods: {
      setActiveTab(tabId) {
        this.$emit('setActiveTab', tabId);
      },
      toggleFindReplace() {
        this.$emit('toggleFindReplace');
      },
      chooseFind(find) {
        this.$emit('chooseFind', find);
      },
      removeFind() {
        this.$emit('removeFind');
      },
      chooseReplace(replace) {
        this.$emit('chooseReplace', replace);
      },
      removeReplace() {
        this.$emit('removeReplace');
      },
      submitFindReplace() {
        this.$emit('submitFindReplace');
      },

      deactivateDropdowns() {
        this.$emit('deactivateDropdowns');
      }
    },
    computed: {
      isMobile() {
        return (this.viewPortWidth < 1007);
      },
      dropdownIsOpen() {
        return (this.searchIsActive || this.findReplaceIsActive)
      }
    },
    components: {
      FindAndReplace,
    },
  }

  document.addEventListener('DOMContentLoaded', function() {
    //capture all the burgers
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    //see if you captured any of the greasy things
    if ($navbarBurgers.length > 0) {
      //add a click listener to all of those you caught
      $navbarBurgers.forEach(function ($el) {
        $el.addEventListener('click', () => {
          // Get the target from the "data-target" attribute
          var target = $el.dataset.target;
          var $target = document.getElementById(target);

          // Toggle the classes of the element and the target
          $el.classList.toggle('is-active');
          $target.classList.toggle('is-active');
        });
      });
    }
  });
</script>
<style scoped>
  nav {
    position: relative !important;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    background-color: rgba(26, 24, 27, 0.5);
  }

  .navbar-end, .navbar-brand {
    background-color: rgba(0,0,0,0);
  }

  .navbar-item {
    color:  rgb(173, 110, 154);
    max-width: 100%;
  }

  .navbar-mobile {
    color:  #ffba00;
  }

  .navbar-mobile:hover {
    color: #0ea7ae;
  }

  .navbar-item:hover {
    background-color: rgba(0,0,0,0);
    color: #ffba00;
  }

  .navbar-burger.is-active > span {
    background-color: #00e2c6;
  }

  .navbar-burger > span {
    background-color: rgb(126, 81, 112);
  }

  .navbar-burger:hover {
    background-color: none;
  }

  i {
    vertical-align: middle;
  }
</style>
