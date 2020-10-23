const path = require('path')
const config_files = {
    "node" :'nginx_config/node.conf'
}


const commands ={
    
    "cpDefault":(pass,appType,filename)=>{
        return `echo ${pass} | sudo -S cp ${config_files[appType]} ${filename}`
    },
    "enablefile": (pass,filename) => `echo ${pass} | sudo ln -s ${filename} /etc/nginx/sites-enabled/`,
    "restart":(pass)=>`echo ${pass} | sudo -S systemctl restart nginx`,
    "enable": (pass)=>`echo ${pass} | sudo -S systemctl enable nginx`,
    "add host":(domain)=>`echo '${domain}' >> /etc/hosts`,
    "check" : (pass)=>`echo ${pass} | sudo -S nginx -t`
}

exports.commands = commands 