<template>
  <v-app>
    <v-main class="bg-surface">
      <v-container class="py-10">
        <v-row justify="center">
          <v-col
            cols="12"
            md="8"
            lg="6"
          >
            <v-sheet
              rounded="lg"
              elevation="8"
              class="pa-8"
            >
              <router-view />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
