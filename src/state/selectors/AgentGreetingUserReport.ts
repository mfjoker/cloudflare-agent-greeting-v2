import { selector } from "recoil";
import { promptsState } from "../atoms/prompts";
import { groupMembersState } from "../atoms/groupMembers";

export interface IAgentGreetingUserReport {
  id: string;
  name: string;
  hasInboundPrompt: boolean;
  hasOutboundPrompt: boolean;
  inbound: IPromptState;
  outbound: IPromptState;
}

export interface IPromptState {
  hasResources: boolean;
  resourceState: IResourceState[];
}

export interface IResourceState {
  language: string;
  hasAudio: boolean;
}

export const agentGreetingUserReportState = selector<
  IAgentGreetingUserReport[]
>({
  key: "agentGreetingUserReportState",
  get: ({ get }) => {
    const members = get(groupMembersState);
    const prompts = get(promptsState);
    // console.log("(selectedMemberInboundPrompt) -All  Prompts: ", prompts);
    const agents: IAgentGreetingUserReport[] = [];
    members.map((member) => {
      const inboundPromptName: string = `AG_${member.id.replace(
        /-/g,
        "_"
      )}_inbound`;
      const outboundPromptName: string = `AG_${member.id.replace(
        /-/g,
        "_"
      )}_outbound`;
      const agentGreetingUserReport: IAgentGreetingUserReport = {
        id: member.id,
        name: member.name,
        hasInboundPrompt: false,
        hasOutboundPrompt: false,
        inbound: { hasResources: false, resourceState: [] },
        outbound: { hasResources: false, resourceState: [] },
      };
      prompts.map((prompt) => {
        if (prompt.name?.toLowerCase() === inboundPromptName?.toLowerCase()) {
          agentGreetingUserReport.hasInboundPrompt = true;
          if (prompt.resources) {
            agentGreetingUserReport.inbound.hasResources = true;
            prompt.resources.map((resource) => {
              agentGreetingUserReport.inbound.resourceState.push({
                language: resource.language || "",
                hasAudio: resource.mediaUri ? resource.mediaUri !== "" : false,
              });
            });
          }
        }
        if (prompt.name?.toLowerCase() === outboundPromptName?.toLowerCase()) {
          agentGreetingUserReport.hasOutboundPrompt = true;
          if (prompt.resources) {
            agentGreetingUserReport.outbound.hasResources = true;
            prompt.resources.map((resource) => {
              agentGreetingUserReport.outbound.resourceState.push({
                language: resource.language || "",
                hasAudio: resource.mediaUri ? resource.mediaUri !== "" : false,
              });
            });
          }
        }
      });
      agents.push(agentGreetingUserReport);
    });
    return agents;
  },
});
