import { describe, expect, it } from "vitest";

import {
  buildMessageStudioPreview,
  parseLines,
  parseListSections,
} from "./message-studio.js";

describe("message studio", () => {
  it("parseLines trims and removes empty lines", () => {
    expect(parseLines(" one \n\n two ")).toEqual(["one", "two"]);
  });

  it("parseListSections builds normalized rows", () => {
    expect(parseListSections("id-1|Title 1|Desc 1")).toEqual([
      {
        id: "id-1",
        title: "Title 1",
        description: "Desc 1",
      },
    ]);
  });

  it("buildMessageStudioPreview renders template preview", () => {
    const preview = buildMessageStudioPreview({
      mode: "template",
      selectedTemplate: {
        _id: "1",
        metaTemplateId: "mt1",
        name: "welcome_template",
        category: "MARKETING",
        language: "en",
        status: "APPROVED",
        variables: ["{{1}}", "{{2}}"],
        components: [],
        rawPayload: {},
        updatedAt: new Date().toISOString(),
        isSendable: true,
      },
    });

    expect(preview).toMatch(/welcome_template/);
    expect(preview).toMatch(/Body vars: \{\{1\}\}: -, \{\{2\}\}: -/);
  });

  it("buildMessageStudioPreview renders selected template header media", () => {
    const preview = buildMessageStudioPreview({
      mode: "template",
      templateHeaderFormat: "IMAGE",
      selectedTemplate: {
        _id: "1",
        metaTemplateId: "mt1",
        name: "hero_template",
        category: "MARKETING",
        language: "en",
        status: "APPROVED",
        variables: [],
        components: [],
        rawPayload: {},
        updatedAt: new Date().toISOString(),
        isSendable: true,
      },
      selectedTemplateHeaderMedia: {
        _id: "media-1",
        metaMediaId: "meta-media-1",
        customName: "Hero Banner",
        fileName: "hero-banner.png",
        mimeType: "image/png",
        mediaType: "image",
        fileSize: 1024,
        uploadedAt: new Date().toISOString(),
        responsePayload: {},
      },
    });

    expect(preview).toMatch(/Header: IMAGE \| Hero Banner/);
  });

  it("buildMessageStudioPreview renders location preview", () => {
    const preview = buildMessageStudioPreview({
      mode: "location",
      locationName: "NiWa HQ",
      latitude: "22.57",
      longitude: "88.36",
    });

    expect(preview).toMatch(/NiWa HQ/);
    expect(preview).toMatch(/22.57, 88.36/);
  });
});
