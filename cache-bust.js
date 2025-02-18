const fs = require("fs-extra");
const crypto = require("crypto");
const path = require("path");

// Configurações
const cssFolder = "css";
const cssFile = `${cssFolder}/main.css`; // Caminho para o CSS original
const htmlFile = "index.html"; // Seu arquivo HTML

// Função para gerar o hash do arquivo
const generateHash = (content) => {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 6);
};

// Função para apagar versões antigas
const deleteOldCss = async (folder, currentFile) => {
  const files = await fs.readdir(folder);

  for (const file of files) {
    if (
      file.startsWith("main-") &&
      file.endsWith(".css") &&
      file !== path.basename(currentFile)
    ) {
      await fs.remove(path.join(folder, file));
      console.log(`Deletado CSS antigo: ${file}`);
    }
  }
};

// Função principal
const cacheBust = async () => {
  try {
    // Lê o arquivo CSS original
    const cssContent = await fs.readFile(cssFile, "utf-8");
    const hash = generateHash(cssContent);

    // Novo nome para o CSS com hash
    const newCssFile = `${cssFolder}/main-${hash}.css`;

    // Copia o CSS original com o novo nome
    await fs.copy(cssFile, newCssFile);

    // Atualiza a referência no HTML
    let htmlContent = await fs.readFile(htmlFile, "utf-8");
    htmlContent = htmlContent.replace(
      /href="\.\/css\/main-.*?\.css"/g,
      `href="./${newCssFile}"`,
    );
    htmlContent = htmlContent.replace(
      /href="\.\/css\/main.css"/g,
      `href="./${newCssFile}"`,
    );
    await fs.writeFile(htmlFile, htmlContent);

    // Apaga as versões antigas, mantendo o original e a nova
    await deleteOldCss(cssFolder, newCssFile);

    console.log(`Cache busting concluído: ${newCssFile}`);
  } catch (error) {
    console.error("Erro ao aplicar cache busting:", error);
  }
};

cacheBust();
