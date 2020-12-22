const path = require('path')
const config_files = {
    "node": 'nginx_config/node.conf'
}


const commands = {

    "cpDefault": (pass, appType, filename) => {
        let obj = {};
        obj.normal = `echo ${pass} | sudo -S cp ${config_files[appType]} ${filename}`;
        return obj;
    },
    "enablefile": (pass, filename) => {
        let obj = {}
        obj.normal = `echo ${pass} | sudo ln -s ${filename} /etc/nginx/sites-enabled/`;
        return obj;
    },
    "restart": (pass) => {
        let obj = {};
        obj.normal = `echo ${pass} | sudo -S systemctl restart nginx`
        return obj;
    },
    "enable": (pass) => {
        let obj = {};
        obj.normal = `echo ${pass} | sudo -S systemctl enable nginx`
        return obj;
    },
    "add host": (domain) => {
        let obj = { "normal": `echo '${domain}' >> /etc/hosts` }
        return obj;
    },
    "check": (pass) => {
        let obj = { "normal": `echo ${pass} | sudo -S nginx -t` }
        return obj;
    }
}

exports.commands = commands 