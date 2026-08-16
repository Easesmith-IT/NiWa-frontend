import test from "node:test";
import assert from "node:assert/strict";

import {
  buildMessageStudioPreview,
  parseLines,
  parseListSections,
} from "./message-studio.js";

test("parseLines trims and removes empty lines", () => {
  assert.deepEqual(parseLines(" one \n\n two "), ["one", "two"]);
});

test("parseListSections builds normalized rows", () => {
  assert.deepEqual(parseListSections("id-1|Title 1|Desc 1"), [
    {
      id: "id-1",
      title: "Title 1",
      description: "Desc 1",
    },
  ]);
});

test("buildMessageStudioPreview renders template preview", () => {
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

  assert.match(preview, /welcome_template/);
  assert.match(preview, /Body vars: \{\{1\}\}: -, \{\{2\}\}: -/);
});

test("buildMessageStudioPreview renders selected template header media", () => {
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

  assert.match(preview, /Header: IMAGE \| Hero Banner/);
});

test("buildMessageStudioPreview renders location preview", () => {
  const preview = buildMessageStudioPreview({
    mode: "location",
    locationName: "NiWa HQ",
    latitude: "22.57",
    longitude: "88.36",
  });

  assert.match(preview, /NiWa HQ/);
  assert.match(preview, /22.57, 88.36/);
});
