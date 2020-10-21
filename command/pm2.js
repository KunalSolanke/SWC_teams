const server_username = process.env.SERVER_USERNAME

commands ={
    "addtoboot":"pm2 startup systemd",
    "start" : (filename)=>`pm2 start ${filename}`,
    "userBoot": `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ${server_username} --hp /home/${server_username}`
}
