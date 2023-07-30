# Webhook plugin

This plugin insert the response of a webhook in a note.

## Installation

Follow the
[instructions to add a plugin](https://www.fleetingnotes.app/docs/plugins/add-a-plugin).
Then set the following fields:

- **Alias**: (Whatever you want)
- **Command ID**: `official/webhook`

## Configuration

The `metadata` field can be either a string representing the URL to fetch or an
object with additional properties.

## Example Usage

Once the Webhook plugin for Fleeting Notes is installed and configured, you can
start utilizing it. Here are a few examples of how to use the plugin:

1. **URL**: https://example.com/data
2. **Object URL**:'{"url": "https://example.com/data", "method": "GET",
   "headers": {"Content-Type": "application/json" }, "body": "Request body data"
   }'
