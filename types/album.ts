export type AlbumPhoto = {
  id: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
};

export type AlbumSummary = {
  id: string;
  title: string;
  description: string | null;
  /** YYYY-MM-DD */
  takenOn: string | null;
  isPublic: boolean;
  photoCount: number;
  coverUrl: string | null;
  createdAt: string;
};

export type AlbumDetail = AlbumSummary & {
  photos: AlbumPhoto[];
};

export function formatTakenOn(takenOn: string | null): string | null {
  if (!takenOn) return null;
  const [year, month, day] = takenOn.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}
