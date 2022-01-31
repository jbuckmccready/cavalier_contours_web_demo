<script setup lang="ts">
const links = [
  ["cavalier_contours", "https://github.com/jbuckmccready/cavalier_contours"],
  ["cavalier_contours_web_demo", "https://github.com/jbuckmccready/cavalier_contours_web_demo"],
];
</script>

<template>
  <div class="text-center">
    <p>
      This is a web demo app for visualizing, testing, and documenting the
      <a href="https://github.com/jbuckmccready/cavalier_contours" target="_blank" rel="noopener"
        >cavalier_contours</a
      >
      Rust library.
    </p>
    <p>Use the navigation buttons at the top to view different demos.</p>
    <h3 class="mt-8">Links</h3>
    <ul>
      <li v-for="([name, link], i) in links" :key="i">
        <a :href="link" target="_blank" rel="noopener">{{ name }}</a>
      </li>
    </ul>
  </div>
</template>

<style></style>
