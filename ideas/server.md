${SERVER}/ || portal landing page

```ts
app.use(express.static(path));

cosnt getPackageFromVerdatio = (appKey, resource, tag?) => {
  if(!cache[appKey]){
    const tarBal = await fetch(`/verdatio/packages/${app-key}`);
    storeData(untar(tarbal));
  }
  return cache[appKey][asset];
}

// root
app.get('/', (req, res) => {
  res.send(res.sendFile(`${path}/index.html`));
})

app.get('/app/:appKey', async(req, res) => {
  const packageInfo = await fetch('/verdatio/');
  const appData = await myDb.get('some.data');
  const appManifest = packageInfo && appData;
  res.send(appManifest);
});

app.get('/app/:appKey/assets/:asset', async(req, res) => {
  if(!cache[appKey]){
    const tarBal = await fetch('/verdatio/');
    storeData(untar(tarbal));
  }
  res.sendFile(cache[appKey][asset]);
});

```


foo.com
 - resolve tls
 - decrypt request
 - read from bar.com with ssl
 - forward cookies and args
 - emcrypt with ssl for foo.com response


 - express server (api) api.localhost;
 - nginx rewrite (host) portal.localhost;

 RewriteRule ^app/.*$ https://pro-s-app-ci.azurewebsites.net/api/$1 [R=301,L]
 RewriteRule ^portal/.*$ https://pro-s-app-portal-ci.azurewebsites.net/api/$1 [R=301,L]

 RewriteRule ^app/.*$ https://pro-s-app-fprd.azurewebsites.net/api/$1 [R=301,L]

 - index.html
 - script/portal.mjs

// docker env
 .env
 APP_PORTAL='^app/.*$ https://pro-s-app-ci.azurewebsites.net/api/$1'

 .DockerFile
 from some_image

 RUN echo "RewriteRule ${APP_PORTAL}" > /bin/nginx/rules/.htaccess


.dockerCompose
portal:
 image: @equinor/portal-jc
 env:
    - APP_PORTAL='^app/.*$ https://pro-s-app-pr-234.azurewebsites.net/api/$1'
  volumes:
    - dev/my-app:/cache/my-app/

