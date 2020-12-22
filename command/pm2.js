
const commands = {
    "addtoboot": "pm2 startup systemd",
    "start": (filename) => `pm2 start ${filename}`,
    "userBoot": (pass, server_username) => `echo ${pass} | sudo -S env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ${server_username} --hp /home/${server_username}`
}


exports.commands = commands
