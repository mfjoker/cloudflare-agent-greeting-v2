"use client";
import { IPrompt } from "@/utils/genesys/interface";
import { atom } from "recoil";


export const promptsState = atom({
    key: "promptsState",
    default: [] as IPrompt[],
    });