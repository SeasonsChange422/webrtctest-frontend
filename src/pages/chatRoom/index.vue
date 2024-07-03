<!--
 * @Author: Dhx
 * @Date: 2024-02-27 13:46:28
 * @Description: 
 * @FilePath: \vuetify-project\src\pages\chatRoom\index.vue
-->
<script setup lang="ts">
import roomView from '@/components/chat/roomView.vue';
import sideBar from '@/components/chat/sideBar.vue';
</script>
<template>
    <div class="chatRoomView"><div class="chatRoomView__sideBar">
            <sideBar></sideBar>
        </div>
        <div class="chatRoomView__room">
            <roomView></roomView>
        </div>
        
    </div>
</template>
<style scoped>
@import "@/assets/style/chat/chatRoomIndex.css";
</style>