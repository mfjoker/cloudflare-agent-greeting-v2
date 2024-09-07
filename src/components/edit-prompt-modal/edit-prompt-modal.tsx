import { selectedUserState } from "@/state/atoms/selectedUser";
import { selectedMemberInboundPrompt } from "@/state/selectors/selectedMemberInboundPrompt";
import { selectedMemberOutboundPrompt } from "@/state/selectors/selectedMemberOutboundPrompt";
import { IPrompt, IPromptAsset } from "@/utils/genesys/interface";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  createPrompt,
  createPromptResource,
  deletePromptAudio,
  getPrompt,
  uploadPrompt,
} from "../../utils/genesys/genesysCloudUtils";
import { promptsState } from "@/state/atoms/prompts";
import Recorder from "../recorder/recorder";
import { recorderData } from "@/utils/misc/types";
import { clientConfig } from "../../utils/genesys/clientConfig";
import { addToast, Toast, ToastType } from "../../state/atoms/toastAtom";

type PropTypes = {
  setShow: (show: boolean) => void;
  direction: "inbound" | "outbound";
};

const EditPromptModal = ({ direction, setShow }: PropTypes) => {
  let createdPrompt: IPrompt = {
    id: "",
    name: "",
    description: "",
    resources: [],
  };

  const selectedMember = useRecoilValue(selectedUserState);
  const inboundPrompt = useRecoilValue(selectedMemberInboundPrompt);
  const outboundPrompt = useRecoilValue(selectedMemberOutboundPrompt);
  const [prompts, setPrompts] = useRecoilState(promptsState);
  const [selectedPrompt, setSelectedPrompt] = React.useState<IPrompt | null>(null);
  const [promptName, setPromptName] = useState<string>("");
  const [resources, setResources] = useState<IPromptAsset[]>([]);
  const [showRecorder, setShowRecorder] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const languages: string[] = clientConfig.languages;

  console.log("Selected Member: ", selectedMember);

  useEffect(() => {
    if (direction === "inbound") {
      setSelectedPrompt(inboundPrompt);
      setPromptName(inboundPrompt?.name || "");
      setResources(inboundPrompt?.resources || []);
    }
    if (direction === "outbound") {
      setSelectedPrompt(outboundPrompt);
      setPromptName(outboundPrompt?.name || "");
      setResources(outboundPrompt?.resources || []);
    }
  }, [inboundPrompt, outboundPrompt]);

  async function makeGreetingPrompt() {
    console.log("Creating Prompt");
    let promptName: string = "";
    let description: string = "";
    if (direction === "inbound") {
      promptName = `AG_${selectedMember.id.replace(/-/g, "_")}_inbound`;
      description = `Inbound Greeting for ${selectedMember.name} uploaded by Agent Greeting App`;
    }
    if (direction === "outbound") {
      promptName = `AG_${selectedMember.id.replace(/-/g, "_")}_outbound`;
      description = `Outbound Greeting for ${selectedMember.name} uploaded by Agent Greeting App`;
    }
    await createPrompt(promptName, description)
      .then((data) => {
        console.log("Prompt Created: ", data);
        createdPrompt = {
          id: data.id,
          name: data.name,
          description: data.description,
          resources: [],
        };
        console.log("Created Prompt: ", createdPrompt);
        const theResources: Promise<IPromptAsset | void>[] = languages.map((lang: string) => {
          return makeGreetingPromptResource(data.id || "", lang, "", selectedMember.name);
        });
        return Promise.all(theResources);
      })
      .then((data: (void | IPromptAsset)[]) => {
        console.log("Prompt Resources Created: ", data);
        if (data) {
          createdPrompt.resources = data as IPromptAsset[];
        }
        setPrompts((prev) => [...prev, createdPrompt]);
        const toastProp: Toast = {
          toastType: ToastType.Success,
          title: "Prompt Creation",
          message: `Success. Prompt Created for ${selectedMember.name}`,
          timeoutSeconds: 1,
        };
        addToast(toastProp);
      })
      .catch((err: any) => {
        console.error(err);
        const toastProp: Toast = {
          toastType: ToastType.Error,
          title: "Prompt Creation",
          message: `Error creating prompt. Error: ${err.message}`,
          timeoutSeconds: 1,
        };
        addToast(toastProp);
      });
  }

  async function makeGreetingPromptResource(
    promptId: string,
    language: string,
    mediaUri: string,
    ttsString: string
  ): Promise<IPromptAsset | void> {
    console.log("Creating Prompt Resource");

    const data: IPromptAsset | void = await createPromptResource(promptId, language, mediaUri, ttsString);
    console.log("Prompt Resource Created: ", data);
    return data || undefined;
  }

  async function deletePromptResource(promptId: string, language: string) {
    console.log("Deleting Prompt Resource");
    await deletePromptAudio(promptId, language)
      .then(() => {
        console.log("Prompt Resource Deleted for promptId: ", promptId, " language: ", language);
        return getPrompt(selectedPrompt?.id || "");
      })
      .then((data: IPrompt | void) => {
        console.log("Updated Prompt: ", data);
        const copyofPrompts: IPrompt[] = [...prompts];
        const foundIndex = copyofPrompts.findIndex((prompt: IPrompt) => prompt.id === selectedPrompt?.id);
        console.log("Found Index: ", foundIndex);
        if (foundIndex > -1) {
          copyofPrompts[foundIndex] = data as IPrompt;
          setPrompts(copyofPrompts);
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  async function updatePromptResource(language: string, mediaUri: string) {
    const data: IPromptAsset | void = await uploadPrompt(
      selectedPrompt?.id || "",
      language,
      mediaUri,
      selectedMember.name
    )
      .then((data: IPromptAsset | void) => {
        console.log("Prompt Resource Updated: ", data);
        return data;
      })
      .catch((err: any) => {
        console.error(err);
      });
    return data || undefined;
  }

  const AddPrompt = () => {
    console.log("Add Prompt for user: ", selectedMember, " direction: ", direction);
    makeGreetingPrompt();
  };

  const AddAudio = (lang: string) => {
    // setUploadLang(lang);
    setShowRecorder(true);
    setSelectedLanguage(lang);
    console.log("Add Audio", lang);
    // setRecorder(true);
  };

  const handleRecorderClose = (valueFromRecorder: recorderData) => {
    console.log("Recorder Closed: ", valueFromRecorder);
    setShowRecorder(false);
    let theResources: Promise<IPromptAsset | void>[] = [];
    if (valueFromRecorder.success) {
      if (valueFromRecorder.saveToAllLanguages) {
        theResources = languages.map((lang: string) => {
          return updatePromptResource(lang, valueFromRecorder.blobUri);
        });
        console.log("Updating All Languages: ", theResources);
      } else {
        theResources.push(updatePromptResource(valueFromRecorder.language, valueFromRecorder.blobUri));
      }
      Promise.all(theResources)
        .then(() => {
          // console.log("Prompt Resources Updated: ", data);
          return getPrompt(selectedPrompt?.id || "");
        })
        .then((data: IPrompt | void) => {
          console.log("Updated Prompt: ", data);
          const copyofPrompts: IPrompt[] = [...prompts];
          const foundIndex = copyofPrompts.findIndex((prompt: IPrompt) => prompt.id === selectedPrompt?.id);
          console.log("Found Index: ", foundIndex);
          if (foundIndex > -1) {
            copyofPrompts[foundIndex] = data as IPrompt;
            setPrompts(copyofPrompts);
          }
        })
        .catch((err: any) => {
          console.error(err);
        });
    }
  };

  const ClearAudio = (lang: string) => {
    console.log("Clear Audio", lang);
    deletePromptResource(selectedPrompt?.id || "", lang);
  };

  const handleClose = () => {
    setShow(false);
  };

  return ReactDOM.createPortal(
    <>
      <div className="font-roboto fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center">
        <div className="flex flex-col w-[540px] bg-white p-4 rounded-lg">
          <h3 className="font-bold bg-slate-400 text-neutral-200">
            Edit Prompt <span> - {direction} </span>
          </h3>
          <div className="text-gray-700 mt-4 border border-neutral-300">
            <span className="bg-neutral-200">Prompt Name:</span> {promptName}
          </div>
          <div className="text-gray-700 mb-4 border border-neutral-300">
            <span className="bg-neutral-200">Description:</span> Agent Greeting for {selectedMember.name} created by App
          </div>
          <div>
            {!selectedPrompt ? (
              <button className="bg-green-700 text-neutral-200 rounded-xl p-2 mb-10" onClick={() => AddPrompt()}>
                Add Prompt
              </button>
            ) : (
              <table className="border mt-3 border-black">
                <tbody>
                  {resources.map((res: IPromptAsset, index: number) => (
                    <React.Fragment key={index}>
                      <tr className="border border-black">
                        <td className="font-semibold w-20">{res.id}</td>
                        <td className="border border-black w-32">
                          {!res.mediaUri || res.mediaUri?.trim() === "" ? (
                            <button
                              className="bg-neutral-200 w-32 rounded-xl font-medium"
                              onClick={() => AddAudio(res.language || "")}
                            >
                              Add Audio
                            </button>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="bg-neutral-200 w-32">{res.durationSeconds?.toFixed(1)} sec</button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem onClick={() => AddAudio(res.language || "")}>
                                    Record
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => ClearAudio(res.language || "")}>
                                    Clear
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                        <td className="">
                          {!res.mediaUri || res.mediaUri?.trim() === "" ? (
                            <span>No Audio File for {res.language}</span>
                          ) : (
                            <audio className="h-8" controls>
                              <source src={res.mediaUri} type="audio/wav" />
                            </audio>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button className="bg-blue-500 text-neutral-200 mt-4 p-2 rounded-xl" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
      {showRecorder ? (
        <Recorder
          setShow={setShowRecorder}
          promptId={selectedPrompt?.id || ""}
          language={selectedLanguage}
          onClose={handleRecorderClose}
        />
      ) : null}
    </>,
    document.getElementById("editPromptPortal") as Element | DocumentFragment
  );
};

export default EditPromptModal;
