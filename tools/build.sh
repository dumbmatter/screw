rm -rf build/*
cp src/index.html build

cp -r src/css build/css
rm build/css/*.css
cat src/css/*.css | cleancss -o build/css/app.css

NODE_ENV=production browserify src/app.js > build/app.js
