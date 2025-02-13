#!/bin/bash

# Configurações
cssFolder="css"
cssFile="${cssFolder}/main.css"
htmlFile="index.html"

# Verifica se o arquivo CSS existe
if [ ! -f "$cssFile" ]; then
  echo "Erro: Arquivo CSS não encontrado em $cssFile"
  exit 1
fi

# Função para gerar o hash MD5 do conteúdo do arquivo
generate_hash() {
  md5sum "$1" | awk '{print substr($1, 1, 6)}'
}

# Função para apagar versões antigas
delete_old_css() {
  for file in "$cssFolder"/main-*.css; do
    if [ "$file" != "$1" ]; then
      rm "$file"
      echo "Deletado CSS antigo: $(basename "$file")"
    fi
  done
}

# Gera o hash do CSS
hash=$(generate_hash "$cssFile")
newCssFile="${cssFolder}/main-${hash}.css"

# Copia o CSS original com o novo nome
cp "$cssFile" "$newCssFile"

# Atualiza a referência no HTML
sed -i -E "s|href=\"\.\/css\/main-.*?\.css\"|href=\"./${newCssFile}\"|g" "$htmlFile"
sed -i -E "s|href=\"\.\/css\/main.css\"|href=\"./${newCssFile}\"|g" "$htmlFile"

# Apaga as versões antigas, mantendo o original e a nova
delete_old_css "$newCssFile"

echo "Cache busting concluído: ${newCssFile}"
