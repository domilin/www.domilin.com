const folderAddressPrd = "admin.domilin.com";

// 打包的时候执添加sshServer属性
const config = {};
config.sshServer = [
  {
    config: {
      host: "YourIp",
      port: 22,
      username: "root",
      password: "YourPassword",
      readyTimeout: 30000
    },
    logs: "deploy",
    path: `/data/${folderAddressPrd}/publish.zip`,
    shell: [""]
  }
];

module.exports = config;
