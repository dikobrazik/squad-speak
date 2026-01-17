import { execSync } from "child_process";
import { createWriteStream, writeFileSync } from "fs";
import jsdom from "jsdom";
import { getIconFileContent } from "./iconFileTemplate.ts";
import { kebabTo } from "./utils.ts";

const ICONS_DIR = "./src/components/Icon/icons";
const ICONS_INDEX_FILE = `${ICONS_DIR}/index.ts`;

const [iconUrlString] = process.argv.slice(2);

const iconUrl = new URL(iconUrlString);
const iconName = iconUrl.pathname.split("/")[1].replace("-svg", "");

const html = await fetch(iconUrl).then((res) => res.text());

const dom = new jsdom.JSDOM(html);
const document = dom.window.document;
const downloadKey = document.querySelector(".active-id")?.id.substring(0, 32);
const fileName = `${document.querySelector(".container-header-menu")?.id}/${document.querySelector(".active.toggle-btn")?.id}/iconmonstr-${document.querySelector(".download-btn")?.id}.${document.querySelector(".container-content-preview")?.id}`;

const origin = iconUrl.origin;

const iconDownloadUrl = `${origin}/?s2member_file_download_key=${downloadKey}&s2member_file_download=${fileName}`;

fetch(iconDownloadUrl)
  .then((res) => res.text())
  .then((svg) => {
    const pascalIconName = kebabTo(iconName, "pascal");
    const camelIconName = kebabTo(iconName, "camel");
    const iconTsx = getIconFileContent(iconName, svg);

    writeFileSync(`${ICONS_DIR}/${iconName}.tsx`, iconTsx);

    // Update index.ts file
    const indexFileContent = `export { ${pascalIconName}Icon as ${camelIconName} } from "./${iconName}";\n`;
    const indexWriteStream = createWriteStream(ICONS_INDEX_FILE, {
      flags: "a",
    });
    indexWriteStream.write(indexFileContent);
    indexWriteStream.end();

    execSync(
      `npx @biomejs/biome format --write ${ICONS_DIR}/${iconName}.tsx ${ICONS_INDEX_FILE}`,
    );
  });
