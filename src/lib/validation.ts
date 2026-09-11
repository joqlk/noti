const MAX_NAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 500;
const MAX_ALIAS_LENGTH = 30;

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function validateNoteInput(input: {
  toName: string;
  message: string;
  fromAlias?: string;
}): { ok: true; data: typeof input } | { ok: false; error: string } {
  const toName = normalizeName(input.toName);
  const message = input.message.trim();
  const fromAlias = input.fromAlias?.trim() || undefined;

  if (!toName) {
    return { ok: false, error: "Who is this note for?" };
  }

  if (toName.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Name must be under ${MAX_NAME_LENGTH} characters.` };
  }

  if (!message) {
    return { ok: false, error: "Write something first." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Keep it under ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  if (fromAlias && fromAlias.length > MAX_ALIAS_LENGTH) {
    return {
      ok: false,
      error: `Alias must be under ${MAX_ALIAS_LENGTH} characters.`,
    };
  }

  return { ok: true, data: { toName, message, fromAlias } };
}

export function validateCommentInput(input: {
  message: string;
  fromAlias?: string;
}): { ok: true; data: typeof input } | { ok: false; error: string } {
  const message = input.message.trim();
  const fromAlias = input.fromAlias?.trim() || undefined;

  if (!message) {
    return { ok: false, error: "Write something first." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Keep it under ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  if (fromAlias && fromAlias.length > MAX_ALIAS_LENGTH) {
    return {
      ok: false,
      error: `Alias must be under ${MAX_ALIAS_LENGTH} characters.`,
    };
  }

  return { ok: true, data: { message, fromAlias } };
}
