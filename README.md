# Figma Webfont Exporter

## Create SVG/TTF/EOT/WOFF/WOFF2 fonts from several SVG files with Figma and Gulp.

### Prerequisites
You need to install [Node JS](https://nodejs.org/en/download/) if you dont have it already installed

### 0. Download the zipped repo, extract it and go to the directory
```cd path/to/dir```

### 1. Install NPM dependencies
```npm install```

### 2. Install gulp
```npm install -g gulp```

### 3. Get you figma personal access token
[Documentation on how to get tokens](https://www.figma.com/developers/api#access-tokens)

### Run
```
gulp figma-webfont-exporter --token <FIGMA_PERSONAL_ACCSESS_TOKEN> --fileId <FIGMA_FILE_ID> --fontName myFontName --page 1
```

This will produce in the folder `dist/<FIGMA_FILE_ID>/` fonts (EOT, SVG, TTF, WOFF, WOFF2) and downloaded SVG files.
