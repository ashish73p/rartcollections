import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Shared mock for the generateContent call so each test can control its behaviour.
const generateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: { generateContent },
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
    },
  };
});

const importService = async () => {
  const mod = await import('./geminiService');
  return mod.analyzeArtworkImage;
};

describe('analyzeArtworkImage', () => {
  const ORIGINAL_API_KEY = process.env.API_KEY;

  beforeEach(() => {
    vi.resetModules();
    generateContent.mockReset();
  });

  afterEach(() => {
    process.env.API_KEY = ORIGINAL_API_KEY;
  });

  it('returns mock data and does not call the API when no API key is configured', async () => {
    delete process.env.API_KEY;
    const analyzeArtworkImage = await importService();

    const result = await analyzeArtworkImage('base64data', 'image/png');

    expect(result).toEqual({
      title: 'Untitled Upload',
      description: 'Analysis unavailable without API Key.',
      medium: 'Unknown',
      tags: ['Uploaded'],
    });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('parses and returns the JSON response from Gemini when an API key is present', async () => {
    process.env.API_KEY = 'test-key';
    const payload = {
      title: 'Sunset',
      description: 'A warm evening scene.',
      medium: 'Oil on Canvas',
      tags: ['Landscape', 'Warm'],
    };
    generateContent.mockResolvedValue({ text: JSON.stringify(payload) });

    const analyzeArtworkImage = await importService();
    const result = await analyzeArtworkImage('base64data', 'image/jpeg');

    expect(result).toEqual(payload);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('forwards the image data and mime type to the model request', async () => {
    process.env.API_KEY = 'test-key';
    generateContent.mockResolvedValue({
      text: JSON.stringify({ title: 't', description: 'd', medium: 'm', tags: [] }),
    });

    const analyzeArtworkImage = await importService();
    await analyzeArtworkImage('the-base64', 'image/webp');

    const requestArg = generateContent.mock.calls[0][0];
    const inlinePart = requestArg.contents.parts.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData,
    );
    expect(inlinePart.inlineData).toEqual({ data: 'the-base64', mimeType: 'image/webp' });
    expect(requestArg.config.responseMimeType).toBe('application/json');
  });

  it('returns fallback data when the Gemini call rejects', async () => {
    process.env.API_KEY = 'test-key';
    generateContent.mockRejectedValue(new Error('network down'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const analyzeArtworkImage = await importService();
    const result = await analyzeArtworkImage('base64data', 'image/png');

    expect(result).toEqual({
      title: 'New Acquisition',
      description: 'A beautiful piece of art uploaded to the collection.',
      medium: 'Mixed Media',
      tags: ['Art', 'New'],
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('returns fallback data when the response has no text', async () => {
    process.env.API_KEY = 'test-key';
    generateContent.mockResolvedValue({ text: '' });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const analyzeArtworkImage = await importService();
    const result = await analyzeArtworkImage('base64data', 'image/png');

    expect(result.title).toBe('New Acquisition');
    errorSpy.mockRestore();
  });
});
