import gulp from "gulp";
import browserSync from "browser-sync";
import { filePaths } from "./gulp/config/paths.js";

/**
 * Импорт задач
 */
import { copy } from "./gulp/task/copy.js";
import { copyRootFiles } from "./gulp/task/copy-root-files.js";
import { reset } from "./gulp/task/reset.js";
import { html } from "./gulp/task/html.js";
import { server } from "./gulp/task/server.js";
import { scss } from "./gulp/task/scss.js";
import { javascript } from "./gulp/task/javascript.js";
import { images } from "./gulp/task/images.js";
import { otfToTtf, ttfToWoff, fontStyle } from "./gulp/task/fonts.js";
import { createSvgSprite } from "./gulp/task/create-svg-sprite.js";
import { zip } from "./gulp/task/zip.js";
import { ftpDeploy } from "./gulp/task/ftp-deploy.js";

const isBuild = process.argv.includes("--build");
const browserSyncInstance = browserSync.create();

const handleServer = server.bind(null, browserSyncInstance);
const handleHTML = html.bind(null, isBuild, browserSyncInstance);
const handleSCSS = scss.bind(null, isBuild, browserSyncInstance);
const handleJS = javascript.bind(null, !isBuild, browserSyncInstance);
const handleImages = images.bind(null, isBuild, browserSyncInstance);

/**
 * Наблюдатель за изменениями в файлах
 */
function watcher() {
	gulp.watch(filePaths.watch.static, copy);
	gulp.watch(filePaths.watch.html, handleHTML);
	gulp.watch(filePaths.watch.scss, handleSCSS);
	gulp.watch(filePaths.watch.js, handleJS);
	gulp.watch(filePaths.watch.images, handleImages);
}

/**
 * Последовательная обработка шрифтов
 * */
const fonts = gulp.series(otfToTtf, ttfToWoff, fontStyle);

/**
 * Параллельные задачи в режиме разработки
 * */
const devTasks = gulp.parallel(copy, copyRootFiles, createSvgSprite, handleHTML, handleSCSS, handleJS, handleImages);

/**
 * Основные задачи
 * */
const mainTasks = gulp.series(fonts, devTasks);

/**
 * Построение сценариев выполнения задач
 * */
const dev = gulp.series(reset, mainTasks, gulp.parallel(watcher, handleServer));
const build = gulp.series(reset, mainTasks);
const deployZIP = gulp.series(reset, mainTasks, zip);
const deployFTP = gulp.series(reset, mainTasks, ftpDeploy);

/**
 * Выполнение сценария по умолчанию
 * */
gulp.task("default", dev);

/**
 * Экспорт сценариев
 * */
export { dev, build, deployZIP, deployFTP, createSvgSprite };
