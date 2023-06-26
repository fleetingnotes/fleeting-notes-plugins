# Summarize Source Plugin

This plugin fetches the source of your note and summarizes it into key points
using ChatGPT

**Note**: Private sources (e.g. Gmail) and dynamically loaded sources (e.g.
Twitter Feed) cannot be summarized

## Installation

Follow the
[instructions to add a plugin](https://www.fleetingnotes.app/docs/plugins/add-a-plugin).
Then set the following fields:

- **Alias**: (Whatever you want)
- **Command ID**: `official/summarize-source`

## Configuration

The `metadata` field can be used to configure the predefined prompt to summarize
your text. If you leave the metadata empty, the default prompt is used:

```
Summarize the following text with the most unique and helpful points, into a bullet list of key points and takeaways
```

## Example Usage

Once the Summarize Source plugin for Fleeting Notes is installed and configured,
you can start utilizing its capabilities within your notes. Here are a few
examples of how to use the plugin:

1. **Summarize Webpages**: Summarize web pages into key points
2. **Summarize Youtube Videos**: Set the source with a youtube video
