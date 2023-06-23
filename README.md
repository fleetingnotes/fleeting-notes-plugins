# Fleeting Notes Plugin

Documentation to Create Your Own Plugin:
https://www.fleetingnotes.app/docs/plugins/create-your-own-plugin

## Local webserver setup

1. Install [deno](https://deno.com/manual@v1.33.4/getting_started/installation)
2. Add `.env` file
3. Run script to generate manifest

```
deno run --allow-read --allow-write routes-manifest-generate.ts
```

4. Start webserver

```
deno run --allow-all webserver.ts
```
