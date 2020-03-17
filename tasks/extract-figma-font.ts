import * as Figma from 'figma-api';
import { log, error} from "../utils";
import * as yrags from "yargs";
import * as fs from "fs";
import * as path from "path";
import axios from 'axios';
import webfont from "webfont";

const argv: any = yrags.argv;

export async function extractFigmaFont(): Promise<any> {
    const token = argv.token;
    const fileId = argv.fileId;
    const fontName = argv.fontName || "my-font-name";
    let page = argv.page || 0;

    if(!token || !fileId) {
        error('Please provide personal access token and fileId');
        return;
    }

    if ((page - 1) < 0 ) {
      page = 0;
    } else {
      page -= 1;
    }

    const api = new Figma.Api({
        personalAccessToken: token,
    });
    
    try {
        log(`Getting figma file ${fileId} from figma api`);
        const file = await api.getFile(argv.fileId);
        if (file) {
            log(`Got file`);

            let imagesURL = null;
            if (!file.document.children[page]) {
              error(`Page ${page+1} doesn't exist in this file!`);
              return;
            }

            log(`Getting SVGs from page ${page+1}`);
            const frameIDS = getSVG(file.document.children[page]);

            if (frameIDS && frameIDS.childIDS && frameIDS.childNames) {
                imagesURL = await api.getImage(argv.fileId, {ids: frameIDS.childIDS.toString(), scale:0, format: "svg"});

                const distPath: string = argv.outputDir || `dist/${fileId}`;
                const SVGpath: string = argv.outputDir || `dist/${fileId}/svg/`;
                const FontPath: string = argv.outputDir || `dist/${fileId}/font/`;
                
                if (!fs.existsSync(distPath)){
                    fs.mkdirSync(distPath);
                } else {
                    fs.rmdirSync(distPath, {recursive: true});
                    fs.mkdirSync(distPath);
                }
                if (!fs.existsSync(SVGpath)){
                    fs.mkdirSync(SVGpath);
                }
                if (!fs.existsSync(FontPath)){
                    fs.mkdirSync(FontPath);
                }
                fs.writeFileSync(`${distPath}/${fileId}.json`, JSON.stringify(file));

                await Promise.all(Object.keys(imagesURL.images).map(async (key) =>  {
                  
                    let SVG = await getImage(imagesURL.images[key]);

                    if (SVG) {
                        let node: Figma.Node<any> = file.document.children[page];
                        let idName = node.children.find(item => item.id === key);
                        fs.writeFileSync(SVGpath + idName.name + '.svg', SVG);
                    }
                }));

              await webfont({
                    files: SVGpath + "**/*.svg",
                    fontName: fontName,
                    weight: 400,
                    template: path.resolve(__dirname, '../templates/template.html'),
                    prependUnicode: true,
                  })
                  .then(result => {
                    Object.keys(result).map(type => {
                      if (
                        type === "config" ||
                        type === "usedBuildInTemplate" ||
                        type === "glyphsData"
                      ) {
                        return null;
                      }
          
                      const content = result[type];
                      let file = null;
          
                      if (type !== "template") {
                        file =  path.join(FontPath, `${fontName}.${type}`);
                      } else {
                        file = path.join(FontPath, `${result.config.fontName}.${result.config.template.split('.').pop()}`);
                      }
          
                      log(`Writting ${file}`);
                      return fs.writeFileSync(file, content);
                    })
                  })
                  .catch(error => {
                    throw error;
                  });
            } else {
              error(`Missing FRAMES on page ${page+1}!`);
              return;
            }
        } 
    } catch(e) {
        error(e);
    }
}

async function getImage(imageURL: string) {
    try {
      const response = await axios.get(imageURL, {responseType: 'blob'});
      return response.data
    } catch (error) {
      console.error(error);
    }
}

function getSVG(node: Figma.Node<any>) {
    if (!node) {
        return;
    }
    
    if (node.children) {
        const children: Figma.Node[] = node.children;
        let childIDS = [];
        let childNames = [];
        if (children && children.length) {
            children.forEach(child => { 
                if (child.type === "FRAME") {
                    childIDS.push(child.id);
                    childNames.push(child.name);
                }
            });
            return {childIDS: childIDS, childNames: childNames};
        } else {
          return;
        }
    }
}