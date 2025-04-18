import { formatSubtask } from '../../subtasks/utils/formatSubtask';
import { TaskResponse, TaskWithSubtask } from '../interfaces/task';

export const formatTask = (task: TaskWithSubtask): TaskResponse => {
  const formattedSubtasks = task.subtasks.map((subtask) =>
    formatSubtask(subtask),
  );
  const formattedTask: TaskResponse = {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    deadline: task.deadline,
    subtasks: formattedSubtasks,
  };

  return formattedTask;
};
