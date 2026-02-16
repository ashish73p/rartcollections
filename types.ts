export interface Artwork {
  id: string;
  url: string;
  title: string;
  description: string;
  medium: string;
  year?: string;
  tags: string[];
  dateAdded: number;
}

export interface ArtworkAnalysisResponse {
  title: string;
  description: string;
  medium: string;
  tags: string[];
}
