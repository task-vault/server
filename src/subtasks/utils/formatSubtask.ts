import { Subtask, SubtaskResponse } from '../interfaces/subtask';

export const formatSubtask = (subtask: Subtask): SubtaskResponse => {
  const formattedSubtask: SubtaskResponse = {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.completed,
  };

  return formattedSubtask;
};
