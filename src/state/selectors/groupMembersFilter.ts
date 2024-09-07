import { selector } from "recoil";
import { athenticatedUserState } from "../atoms/authenticatedUser";
import { groupMembersState } from "../atoms/groupMembers";
import { clientConfig } from "../../utils/genesys/clientConfig";
import { GroupMember } from "../../utils/misc/types";

export const filteredGroupMembers = selector<GroupMember[]>({
    key: "FilteredGroupMembers",
    get: ({get}) => {
        const groupMembers = get(groupMembersState);
        const authenticatedUser = get(athenticatedUserState);
        const {agentGreetingAdminRole} = clientConfig;

        if (authenticatedUser.roles.includes(agentGreetingAdminRole)) {
            return groupMembers;
          }

        const filteredGroupMembers = groupMembers.filter(
            (member) => member.id === authenticatedUser.id
          );
          return filteredGroupMembers;
        }
    
});