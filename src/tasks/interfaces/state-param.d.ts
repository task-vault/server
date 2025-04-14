export const states = ['completed', 'pending', 'overdue'] as const;
export type State = (typeof states)[number];
