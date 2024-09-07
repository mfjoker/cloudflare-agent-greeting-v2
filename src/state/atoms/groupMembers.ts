import { GroupMember } from "../../utils/misc/types";
import { atom } from "recoil";


export const groupMembersState = atom({
    key: "groupMembersState",
    default: [] as GroupMember[],
    });