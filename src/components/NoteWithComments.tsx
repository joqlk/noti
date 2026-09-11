"use client";

import { NoteCard, type Note } from "./NoteCard";
import { NoteComments } from "./NoteComments";

export type FeedNote = Note & {
  commentCount: number;
};

export function NoteWithComments({ note }: { note: FeedNote }) {
  return (
    <div className="note-card group !pb-4">
      <NoteCard note={note} embedded />
      <NoteComments noteId={note.id} initialCount={note.commentCount} />
    </div>
  );
}
