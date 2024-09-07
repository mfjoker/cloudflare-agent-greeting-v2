import { selector } from "recoil";
import { selectedUserState } from "../atoms/selectedUser";
import { promptsState } from "../atoms/prompts";
import { IPrompt } from "../../utils/genesys/interface";

export const selectedMemberOutboundPrompt = selector<IPrompt | null>({
  key: "selectedMemberOutboundPrompt",
  get: ({ get }) => {
    const member = get(selectedUserState);
    const prompts = get(promptsState);
    // console.log("(selectedMemberOutboundPrompt) -All Prompts: ", prompts);

    const outboundPromptName = `AG_${member.id.replace(/-/g, "_")}_outbound`;
    // console.log("Outbound Prompt Name: ", outboundPromptName);

    const outboundPrompts = prompts.filter(
      (prompt) =>
        prompt?.name?.toLowerCase() === outboundPromptName?.toLowerCase()
    );
    // if (outboundPrompts.length > 0) console.log("Outbound Prompts: ", outboundPrompts);
    console.log(
      "(selectedMemberOutboundPrompt) -Outbound Prompts: ",
      outboundPrompts
    );
    if (outboundPrompts.length > 0) return outboundPrompts[0];

    return null;
  },
});
