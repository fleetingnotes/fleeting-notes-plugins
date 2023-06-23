const TRANSCRIPT_YOUTUBE_URI =
  "https://www.youtube.com/youtubei/v1/get_transcript";

export function isYouTubeURL(url: string): boolean {
  const youtubeURLPattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
  return youtubeURLPattern.test(url);
}

function generateNonce(length: number): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charsetLength = charset.length;

  let nonce = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    nonce += charset[randomIndex];
  }

  return nonce;
}

function generateRequest(page: string) {
  const params = page.split('"serializedShareEntity":"')[1]?.split('"')[0];
  const visitorData = page.split('"VISITOR_DATA":"')[1]?.split('"')[0];
  const sessionId = page.split('"sessionId":"')[1]?.split('"')[0];
  const clickTrackingParams = page
    ?.split('"clickTrackingParams":"')[1]
    ?.split('"')[0];
  return {
    context: {
      client: {
        hl: "en",
        gl: "US",
        visitorData,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",
        clientName: "WEB",
        clientVersion: "2.20200925.01.00",
        osName: "Macintosh",
        osVersion: "10_15_4",
        browserName: "Chrome",
        browserVersion: "85.0f.4183.83",
        screenWidthPoints: 1440,
        screenHeightPoints: 770,
        screenPixelDensity: 2,
        utcOffsetMinutes: 120,
        userInterfaceTheme: "USER_INTERFACE_THEME_LIGHT",
        connectionType: "CONN_CELLULAR_3G",
      },
      request: {
        sessionId,
        internalExperimentFlags: [],
        consistencyTokenJars: [],
      },
      user: {},
      clientScreenNonce: generateNonce(16),
      clickTracking: {
        clickTrackingParams,
      },
    },
    params,
  };
}

export async function transcriptYoutubeVideo(html: string): Promise<string> {
  const innerTubeApiKey = html
    .toString()
    .split('"INNERTUBE_API_KEY":"')[1]
    .split('"')[0];
  if (!innerTubeApiKey) {
    throw new Error("Source Youtube API key not found");
  }

  const transcriptData = await fetch(
    `${TRANSCRIPT_YOUTUBE_URI}?key=${innerTubeApiKey}`,
    {
      method: "POST",
      body: JSON.stringify(generateRequest(html.toString())),
    },
  );
  const body = await transcriptData.json();
  if (!body.responseContext || !body.actions) {
    throw new Error("Transcript is disabled on this source");
  }

  const transcripts = body.actions[0].updateEngagementPanelAction.content
    .transcriptRenderer.body.transcriptBodyRenderer.cueGroups;

  const text = transcripts.map((
    // deno-lint-ignore no-explicit-any
    cue: any,
  ) => (cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
    .cue.simpleText)
  );
  const transcript = text.join(" ");
  if (transcript.length == 0) {
    throw new Error("Failed to transcript text from source");
  }
  return transcript;
}
