module.exports = {
    name: 'dexapi',
    script: 'server.js',
    max_memory_restart: '2000M',
    exec_mode: "cluster",
    instances: 'max',
    instance_var: 'INSTANCE_ID',
}