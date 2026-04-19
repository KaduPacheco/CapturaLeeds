import { useState } from "react";

export function useLeadDetailDrafts() {
  const [newNote, setNewNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");

  return {
    newNote,
    setNewNote,
    resetNewNote: () => setNewNote(""),
    taskTitle,
    setTaskTitle,
    taskDate,
    setTaskDate,
    resetTaskDraft: () => {
      setTaskTitle("");
      setTaskDate("");
    },
  };
}
