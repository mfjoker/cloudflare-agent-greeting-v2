import { selector } from "recoil";
import { selectedUserState } from "../atoms/selectedUser";
import { promptsState } from "../atoms/prompts";
import { IPrompt } from "../../utils/genesys/interface";

export const selectedMemberInboundPrompt = selector<IPrompt | null>({
  key: "selectedMemberInboundPrompt",
  get: ({ get }) => {
    const member = get(selectedUserState);
    const prompts = get(promptsState);
    // console.log("(selectedMemberInboundPrompt) -All  Prompts: ", prompts);

    const inboundPromptName = `AG_${member.id.replace(/-/g, "_")}_inbound`;
    // console.log("Inbound Prompt Name: ", inboundPromptName);
    // console.log("Outbound Prompt Name: ", outboundPromptName);
    if (prompts.length === 0) return null;

    const inboundPrompts = prompts.filter(
      (prompt) =>
        prompt?.name?.toLowerCase() === inboundPromptName?.toLowerCase()
    );
    // if (inboundPrompts.length > 0) console.log("Inbound Prompts: ", inboundPrompts);
    console.log(
      "(selectedMemberInboundPrompt) -Inbound Prompts: ",
      inboundPrompts
    );

    if (inboundPrompts.length > 0) return inboundPrompts[0];

    return null;
  },
});
