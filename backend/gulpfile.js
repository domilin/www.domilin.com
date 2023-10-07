const gulp = require("gulp");
const clean = require("gulp-clean");
const gulpZip = require("gulp-zip");

const configServer = require("./config/config-server");

// 清除_temp文件夹
gulp.task("cleanTemp", () => {
  return gulp.src(["_temp"], { read: false, allowEmpty: true }).pipe(clean({ force: true }));
});

/* ----------------------------------------以下为zip及ssh上传部分---------------------------------------- */

// 拷贝文件到上传目录
gulp.task("copyFile", function () {
  return gulp
    .src(["dist/**", "static/resources/**", "package.json", "package-lock.json", '.nvmrc'], { base: "." })
    .pipe(gulp.dest("./_temp"));
});

// 打包上传目录文件(所有打包后的包括静态资源，一些不是绝对路径的仍然在static路径下)
gulp.task("zipFile", function () {
  return gulp
    .src(["_temp/**"])
    .pipe(gulpZip("publish.zip"), { base: "." })
    .pipe(gulp.dest("./_temp"));
});

// 部署已打包好文件
gulp.task("deploy", function () {
  const deploySSH = require("./config/deploy-ssh");
  return gulp.src("./_temp/publish.zip", { base: "." }).pipe(
    deploySSH({
      sshServer: configServer.sshServer,
    })
  );
});

/* ----------------------------------------开发打包---------------------------------------- */
gulp.task("buildPrd", gulp.series("cleanTemp", "copyFile", "zipFile", "deploy"));
