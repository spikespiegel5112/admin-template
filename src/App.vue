<template>
    <div>
        <router-view />
    </div>
</template>

<script>
export default {
    name: 'App',
    created() {
        document.querySelector('.loading_container').style.display = 'none'
    }
}
</script>
