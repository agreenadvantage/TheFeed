cd bigpicture-front/source
npm run build
cd ../..
mkdir -p bigpicture-front/app/dist/static/images/
cp bigpicture-front/source/src/assets/*.png bigpicture-front/app/dist/static/images/
