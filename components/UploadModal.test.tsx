import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UploadModal from './UploadModal';
import { analyzeArtworkImage } from '../services/geminiService';

vi.mock('../services/geminiService', () => ({
  analyzeArtworkImage: vi.fn(),
}));

const analysis = {
  title: 'Analyzed Title',
  description: 'Analyzed description',
  medium: 'Digital',
  tags: ['AI', 'Generated'],
};

const makeImageFile = () =>
  new File(['binarydata'], 'art.png', { type: 'image/png' });

describe('UploadModal', () => {
  beforeEach(() => {
    vi.mocked(analyzeArtworkImage).mockReset();
    vi.mocked(analyzeArtworkImage).mockResolvedValue(analysis);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <UploadModal isOpen={false} onClose={() => {}} onUploadComplete={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the dropzone and heading when open', () => {
    render(
      <UploadModal isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />,
    );
    expect(screen.getByText('Add to Collection')).toBeInTheDocument();
    expect(
      screen.getByText('Click to upload, drag & drop'),
    ).toBeInTheDocument();
  });

  it('calls onClose when the close (X) button is clicked', () => {
    const onClose = vi.fn();
    render(
      <UploadModal isOpen={true} onClose={onClose} onUploadComplete={() => {}} />,
    );
    // First button in the header is the close button.
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('analyzes a selected image and reports the new artwork', async () => {
    const onUploadComplete = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <UploadModal
        isOpen={true}
        onClose={onClose}
        onUploadComplete={onUploadComplete}
      />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeImageFile()] } });

    await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));

    expect(analyzeArtworkImage).toHaveBeenCalledWith(
      expect.any(String),
      'image/png',
    );
    const created = onUploadComplete.mock.calls[0][0];
    expect(created).toMatchObject({
      title: analysis.title,
      description: analysis.description,
      medium: analysis.medium,
      tags: analysis.tags,
    });
    expect(typeof created.id).toBe('string');
    expect(created.id.length).toBeGreaterThan(0);
    expect(onClose).toHaveBeenCalled();
  });

  it('ignores non-image files', async () => {
    const onUploadComplete = vi.fn();
    const { container } = render(
      <UploadModal
        isOpen={true}
        onClose={() => {}}
        onUploadComplete={onUploadComplete}
      />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const textFile = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [textFile] } });

    await Promise.resolve();
    expect(analyzeArtworkImage).not.toHaveBeenCalled();
    expect(onUploadComplete).not.toHaveBeenCalled();
  });

  it('handles an image dropped onto the dropzone', async () => {
    const onUploadComplete = vi.fn();
    render(
      <UploadModal
        isOpen={true}
        onClose={() => {}}
        onUploadComplete={onUploadComplete}
      />,
    );

    const dropzone = screen.getByText('Click to upload, drag & drop')
      .closest('div') as HTMLElement;

    fireEvent.dragOver(dropzone);
    fireEvent.dragLeave(dropzone);
    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [makeImageFile()] },
    });

    await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
  });

  it('shows the analyzing state while the AI curator is working', async () => {
    let resolveAnalysis: (v: typeof analysis) => void = () => {};
    vi.mocked(analyzeArtworkImage).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAnalysis = resolve;
        }),
    );

    const { container } = render(
      <UploadModal isOpen={true} onClose={() => {}} onUploadComplete={() => {}} />,
    );

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeImageFile()] } });

    expect(await screen.findByText('Curating & Analyzing')).toBeInTheDocument();
    resolveAnalysis(analysis);
  });

  it('analyzes an image pasted from the clipboard', async () => {
    const onUploadComplete = vi.fn();
    render(
      <UploadModal
        isOpen={true}
        onClose={() => {}}
        onUploadComplete={onUploadComplete}
      />,
    );

    const file = makeImageFile();
    const pasteEvent = new Event('paste', { bubbles: true }) as Event & {
      clipboardData: unknown;
    };
    pasteEvent.clipboardData = {
      items: [
        {
          type: 'image/png',
          getAsFile: () => file,
        },
      ],
    };
    document.dispatchEvent(pasteEvent);

    await waitFor(() => expect(onUploadComplete).toHaveBeenCalledTimes(1));
  });

  it('ignores paste events that contain no image', async () => {
    const onUploadComplete = vi.fn();
    render(
      <UploadModal
        isOpen={true}
        onClose={() => {}}
        onUploadComplete={onUploadComplete}
      />,
    );

    const pasteEvent = new Event('paste', { bubbles: true }) as Event & {
      clipboardData: unknown;
    };
    pasteEvent.clipboardData = {
      items: [{ type: 'text/plain', getAsFile: () => null }],
    };
    document.dispatchEvent(pasteEvent);

    await Promise.resolve();
    expect(onUploadComplete).not.toHaveBeenCalled();
  });
});
