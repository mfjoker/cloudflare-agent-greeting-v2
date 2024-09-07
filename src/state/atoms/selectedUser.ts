import { GroupMember } from "../../utils/misc/types";
import { atom } from "recoil";

export const selectedUserState = atom<GroupMember>({
    key: "selectedUserState",
    default: {id: "", name: "", username: ""} as GroupMember,
    });
    