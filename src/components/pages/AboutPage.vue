<script setup lang="ts">
const links = [
  ["cavalier contours repo", "https://github.com/jbuckmccready/cavalier_contours"],
  [
    "cavalier contours web demo repo",
    "https://github.com/jbuckmccready/cavalier_contours_web_demo",
  ],
];
</script>

<template>
  <div class="max-w-lg m-auto">
    <p>
      This is a web demo app for visualizing, testing, and documenting the
      <a href="https://github.com/jbuckmccready/cavalier_contours" target="_blank" rel="noopener"
        >cavalier contours</a
      >
      Rust library. Use the navigation buttons at the top to view different demos.
    </p>
    <br />
    <p>This web page is created by compiling the cavalier contours Rust code to web assembly.</p>
    <div class="mt-10 font-semibold">Links</div>
    <ul>
      <li v-for="([name, link], i) in links" :key="i">
        <a :href="link" target="_blank" rel="noopener">{{ name }}</a>
      </li>
    </ul>
  </div>
</template>

<style></style>
