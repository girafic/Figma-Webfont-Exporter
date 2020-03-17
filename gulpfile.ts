import * as gulp from "gulp";
import { extractFigmaFont } from "./tasks/extract-figma-font";


gulp.task("figma-webfont-exporter", extractFigmaFont);