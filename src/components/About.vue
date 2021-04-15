<template>
  <div>
    <p>
      This is a web demo app for vizualizing, testing, and documenting the
      <a
        href="https://github.com/jbuckmccready/cavalier_contours"
        target="_blank"
        rel="noopener"
        >cavalier_contours</a
      >
      Rust library.
    </p>
    <h3>Links</h3>
    <ul>
      <li>
        <a
          href="https://github.com/jbuckmccready/cavalier_contours"
          target="_blank"
          rel="noopener"
          >cavalier_contours</a
        >
      </li>
      <li>
        <a
          href="https://github.com/jbuckmccready/cavalier_contours_web_demo"
          target="_blank"
          rel="noopener"
          >cavalier_contours_web_demo</a
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "About",
  setup() {
    return {};
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
