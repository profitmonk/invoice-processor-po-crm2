https://wasp.sh/docs/deployment/deployment-methods/paas
 2092  fly apps list
 2093  fly apps destroy my-invoice-app-server --yes\nfly apps destroy my-invoice-app-server-shy-snowflake-2501 --yes\nfly apps destroy my-invoice-app-client --yes\nfly apps destroy my-invoice-app-client-muddy-leaf-4203 --yes\nfly apps destroy my-invoice-app-db --yes\nfly apps destroy my-invoice-app-shy-snowflake-2501-db --yes\n
 2094  fly apps list  
 2095  rm -rf *toml
 2096  trash .wasp .fly node_modules
 2097  trash .wasp node_modules
 2098  wasp clean
 2099  wasp build
 2100  ls -lrt main.wasp
 2101  date
 2102  wasp deploy fly launch my-invoice-app dfw
 2103  fly secrets list my-invoice-app-server
 2104  fly secrets list --app my-invoice-app-server
 2105  sh installFlySecrets.sh
 2106  fly secrets list -a my-invoice-app-server
 2107  fly ssh console -a my-invoice-app-server
 2108  fly apps status
 2109  fly apps list
 2110  fly ssh console -a my-invoice-app-server
 2111  vi 1
 2112  fly ssh console -a my-invoice-app-server
 2113  grep -r "me@example.com" src/\ngrep -r "me@example.com" main.wasp\ngrep -r "me@example.com" .env.server
 2114  vi main.wasp
 2115  vi main.wasp
 2116  vi .env.server
 2117  wasp clean\n
 2118  wasp build
 2119  cd .wasp/build
 2120  fly deploy --app my-invoice-app-server
 2121  history 0


##### NEW NEW NEW #####
 1074  fly apps destroy my-invoice-po-crm-app-client --yes
 1075  fly apps destroy my-invoice-po-crm-app-db --yes
 1076  fly apps destroy my-invoice-po-crm-app-server --yes
 1077  rm fly*toml
 1078  pwd
 1079  cd ../../../
 1080  rm fly*toml
wasp clean
wasp build
wasp start
cd .wasp/out/web-app
npm install react@^18.2.0 react-dom@^18.2.0
export REACT_APP_API_URL=https://my-invoice-po-crm-app-server.fly.dev
export WASP_WEB_CLIENT_URL=https://my-invoice-po-crm-app-client.fly.dev
export WASP_SERVER_URL=https://my-invoice-po-crm-app-server.fly.dev
 1081  wasp deploy fly launch my-invoice-po-crm-app dfw
 1082  sh installFlySecrets.sh
 1083  history
 1085  less
 1086  curl https://my-invoice-po-crm-app-server.fly.dev/health
 1087  less main.wasp
 1088  cd .wasp/build/web-app
 1089  npm install react@^18.2.0 react-dom@^18.2.0
 1090  npm install
 1091  npm run build
 1092  fly deploy --remote-only 
 1093  history 0
 1094  cd ../../../
export DATABASE_URL=postgres://postgres:nZM7fNMAjLGMI8T@my-invoice-po-crm-app-db.flycast:5432 - THIS IS DEFAULT DB WITHIN FLY. USE NEXT LINE
export DATABASE_URL="postgresql://my_invoice_po_crm_app_server:H7hAvW1IiNphKyl@localhost:15432/my_invoice_po_crm_app_server"
