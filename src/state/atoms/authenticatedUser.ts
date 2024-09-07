import { authenticatedUser } from "../../utils/misc/types";
import { atom } from "recoil";



export const athenticatedUserState = atom({
    key: "athenticatedUserState",
    default: {id: "", name: "", email: "", roles: [], token: ""} as authenticatedUser,
    });