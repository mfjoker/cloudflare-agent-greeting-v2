"use client";

import React from "react";
import EditPromptModal from "../edit-prompt-modal/edit-prompt-modal";
import { selectedUserState } from "@/state/atoms/selectedUser";
import { useRecoilState, useSetRecoilState } from "recoil";
import { GroupMember } from "../../utils/misc/types";
import { deletePrompt } from "../../utils/genesys/genesysCloudUtils";
import { IPrompt } from "@/utils/genesys/interface";
import { promptsState } from "../../state/atoms/prompts";

type PropTypes = {
  user: GroupMember;
  direction: "inbound" | "outbound";
};
const EditButtonCell = ({ user, direction }: PropTypes) => {
  const [showEdit, setShowEdit] = React.useState<boolean>(false);
  const setSelectedUser = useSetRecoilState(selectedUserState);
  const [prompts, setPrompts] = useRecoilState(promptsState);

  async function deleteUserPrompt() {
    console.log("Prompts: ", prompts);
    console.log("Deleting Prompt for user: ", user);
    const promptName = `AG_${user.id.replace(/-/g, "_")}_inbound`;
    console.log("Prompt Name: ", promptName);
    const foundIndex = prompts.findIndex((prompt: IPrompt) => prompt.name === promptName);
    console.log("Found Index: ", foundIndex);
    if (foundIndex > -1) {
      const promptId: string = prompts[foundIndex].id || "";
      await deletePrompt(promptId)
        .then(() => {
          const copyofPrompts = prompts.filter((prompt: IPrompt) => prompt.name !== promptName);
          setPrompts(copyofPrompts);
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
  }

  const handleEditClick = () => {
    setSelectedUser(user);
    setShowEdit(true);
    console.log("Edit button clicked for user: ", user);
  };

  const handleDeleteClick = () => {
    console.log("Delete button clicked for user: ", user);
    deleteUserPrompt();
  };

  return (
    <>
      <div className="flex flex-row ml-[-56px]">
        <button onClick={handleEditClick} className="bg-blue-500 w-20 mx-1 py-1 px-2 text-neutral-200 rounded-xl">
          Edit
        </button>
        <button onClick={handleDeleteClick} className="bg-red-500 w-20 mx-1 py-1 px-2 text-neutral-200 rounded-xl">
          Delete
        </button>
      </div>
      {showEdit ? <EditPromptModal direction={direction} setShow={setShowEdit} /> : null}
    </>
  );
};

export default EditButtonCell;
