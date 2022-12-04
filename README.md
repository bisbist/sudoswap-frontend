# Sudoswap Frontend App

## Getting Started

### Start API Server

Inside `server` directory, make a copy of `.env.example` as `.env` and set appropriate values for env variables.

If you already have a `lssvm` repo located somewhere through which you've deployed the lssvm contracts, please use `local_env.sh` command to generate the `.env` file.

```bash
# ./local_env.sh [lssvm_repo_path]
$ ./local_env.sh ../../lssvm
```

After creating or generating the `.env` file, start the server using,

```bash
cd server
yarn start
```

This will start a development API server that will be used by the React frontend app.

### Start React Dev Server

```bash
cd webui
yarn start
```

This will start a React development server.

#### Browse
Open your browser and goto http://localhost:3000. This will open up the React app.
