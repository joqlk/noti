type NoteWithCount = {
  id: string;
  toName: string;
  message: string;
  fromAlias: string | null;
  createdAt: Date;
  _count: { comments: number };
};

export type FeedNote = {
  id: string;
  toName: string;
  message: string;
  fromAlias: string | null;
  createdAt: Date;
  commentCount: number;
};

export function mapFeedNote(note: NoteWithCount): FeedNote {
  return {
    id: note.id,
    toName: note.toName,
    message: note.message,
    fromAlias: note.fromAlias,
    createdAt: note.createdAt,
    commentCount: note._count.comments,
  };
}

export const noteInclude = {
  _count: {
    select: { comments: true },
  },
} as const;
