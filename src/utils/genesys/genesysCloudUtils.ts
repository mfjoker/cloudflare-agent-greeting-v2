import platformClient from "purecloud-platform-client-v2";
import { clientConfig } from "./clientConfig";
import { Toast, ToastType, addToast } from "@/state/atoms/toastAtom";

const { environment, clientId, redirectUri, agentGreetingAdminRole, agentGreetingGroupId, defaultLanguage, languages } =
  clientConfig;
const architectApi = new platformClient.ArchitectApi();
const usersApi = new platformClient.UsersApi();
const groupsApi = new platformClient.GroupsApi();

//const DATATABLE_ID: string = import.meta.env.VITE_REACT_APP_DATATABLE_ID || '';
// const ROLE: string = import.meta.env.VITE_REACT_APP_ROLE || '';

console.log(`environment: ${environment} ,clientId: ${clientId}, redirectUri: ${redirectUri}
  , agentGreetingAdminRole: ${agentGreetingAdminRole}, agentGreetingGroupId: ${agentGreetingGroupId}
  , agentGreetingDefaultLanguage: ${defaultLanguage}`);

const client = platformClient.ApiClient.instance;
client.setEnvironment(environment || "mypurecloud.com");
const cache: any = {};

//Login Implicit Grant
export function authenticate() {
  return client
    .loginImplicitGrant(clientId, redirectUri, { state: "" })
    .then((data: platformClient.AuthData) => {
      console.log("Auth", data);
      return data;
    })
    .catch((err: platformClient.AuthData) => {
      console.error(err);
    });
}

//Get User Me API call
export async function getUserMe(skipCache: boolean = false) {
  if (skipCache) {
    return usersApi.getUsersMe({
      expand: ["routingStatus", "presence", "groups"],
    });
  } else if (cache["userMe"]) {
    return cache["userMe"];
  } else {
    try {
      cache["userMe"] = await usersApi.getUsersMe({
        expand: ["routingStatus", "presence", "groups"],
      });
      return cache["userMe"];
    } catch (err) {
      console.error(err);
    }
  }
}

export function getUserRoles(subjectId: string) {
  return usersApi.getUserRoles(subjectId);
}

export async function getAgentGreetingGroupMembers(): Promise<platformClient.Models.UserEntityListing> {
  const opts: platformClient.GroupsApi.getGroupMembersOptions = {
    pageNumber: 1, // Number | Page number
    pageSize: 100, // Number | Page size
    sortOrder: "ASC", // String | Sort order
  };

  const firstPage = await groupsApi.getGroupMembers(agentGreetingGroupId, opts);
  // console.log('Group Member count: ',firstPage?.entities?.length);
  // console.log('Group Member Pages: ',firstPage?.pageCount);
  if (firstPage && (firstPage?.pageCount ?? 0) > 1) {
    const restOfPages = await Promise.all(
      Array.from({ length: firstPage?.pageCount ?? 0 - 1 }, (_, i) => {
        return groupsApi.getGroupMembers(agentGreetingGroupId, {
          ...opts,
          pageNumber: i + 2,
        });
      })
    );
    return restOfPages.reduce((acc, page) => {
      acc.entities && acc.entities.push(...(page.entities || []));
      return acc;
    }, firstPage);
  }
  return firstPage;
}

export async function getAgentGreetingPrompts(): Promise<platformClient.Models.PromptEntityListing> {
  const opts = {
    pageNumber: 1, // Number | Page number
    pageSize: 100, // Number | Page size
    nameOrDescription: "AG_*bound", // String | Name or description
    sortBy: "name", // String | Sort by
    sortOrder: "asc", // String | Sort order
    includeMediaUris: true, // Boolean | Include the media URIs for each resource
    includeResources: true, // Boolean | Include the resources for each system prompt
    language: languages, // [String] | Filter the resources down to the provided languages
  };
  const firstPage = await architectApi.getArchitectPrompts(opts);
  if (firstPage && (firstPage?.pageCount ?? 0) > 1) {
    const restOfPages = await Promise.all(
      Array.from({ length: firstPage?.pageCount ?? 0 - 1 }, (_, i) => {
        return architectApi.getArchitectPrompts({ ...opts, pageNumber: i + 2 });
      })
    );
    return restOfPages.reduce((acc, page) => {
      acc.entities && acc.entities.push(...(page.entities || []));
      return acc;
    }, firstPage);
  }
  return firstPage;
  //return architectApi.getArchitectPrompts(opts);
}

export async function createPrompt(promptName: string, description: string): Promise<platformClient.Models.Prompt> {
  const body: platformClient.Models.Prompt = {
    name: promptName,
    description: description,
  };
  return new Promise((resolve, reject) => {
    architectApi
      .postArchitectPrompts(body)
      .then((prompt: platformClient.Models.Prompt) => {
        resolve(prompt);
      })
      .catch((err: string) => {
        console.log(err);
        reject(err);
      });
  });
}

export async function createPromptResource(promptId: string, language: string, mediaUri: string, ttsString: string) {
  const body: platformClient.Models.PromptAssetCreate = {
    id: language,
    language: language,
    mediaUri: mediaUri,
    ttsString: ttsString,
  };
  return architectApi.postArchitectPromptResources(promptId, body).catch((err: string) => console.log(err));
}

export async function getPrompt(promptId: string) {
  const opts = {
    includeMediaUris: true, // Boolean | Include the media URIs for each resource
    includeResources: true, // Boolean | Include the resources for each system prompt
    language: languages, // [String] | Filter the resources down to the provided languages
  };
  return architectApi.getArchitectPrompt(promptId, opts);
}

export async function putArchitectPromptResource(promptId: string, language: string, mediaUri: string) {
  const languageDefault: boolean = language === defaultLanguage ? true : false;
  const body: platformClient.Models.PromptAsset = {
    id: language,
    language: language,
    languageDefault: languageDefault,
    mediaUri: mediaUri,
    promptId: promptId,
  };

  return architectApi.putArchitectPromptResource(promptId, language, body).catch((err: string) => console.log(err));
}

export async function uploadPrompt(
  promptId: string,
  language: string,
  mediaUri: string,
  agentName: string
): Promise<void> {
  const form: FormData = new FormData();
  const response = await fetch(mediaUri);
  const blob: any = await response.blob();
  form.append("file", blob);
  console.log(`language: ${language}, mediaUri: ${mediaUri}`);

  await architectApi
    .getArchitectPrompt(promptId)
    .then(async (prompt: platformClient.Models.Prompt) => {
      const uriIndex =
        prompt.resources?.findIndex((el: platformClient.Models.PromptAsset) => el.language === language) ?? -1;
      const uploadURI: string | undefined = prompt.resources?.[uriIndex]?.uploadUri ?? prompt.resources?.[0]?.uploadUri;
      if (!uploadURI) {
        throw new Error("No upload URI found");
      }
      await fetch(uploadURI, {
        method: "POST",
        // @ts-ignore: client.authData is not recognized (this is a bug)
        headers: { Authorization: "bearer " + client.authData.accessToken },
        body: form,
      })
        .then((res: Response) => {
          //console.log(res);
          return res.json();
        })
        .then(() => {
          const body = { id: language, ttsString: agentName };
          return architectApi.putArchitectPromptResource(promptId, language, body);
        })
        .then((data: platformClient.Models.PromptAsset) => console.log("Put Resource Success", data.id));
      const toastProp: Toast = {
        toastType: ToastType.Success,
        title: "Prompt resource uploaded",
        message: `Success. Prompt resource uploaded for ${language}`,
        timeoutSeconds: 2,
      };
      addToast(toastProp);
    })
    .catch((err: any) => {
      console.log("utils error", err);
      const toastProp: Toast = {
        toastType: ToastType.Error,
        title: "Prompt resource uploaded",
        message: `Error uploading Prompt resource for ${language}`,
        timeoutSeconds: 2,
      };
      addToast(toastProp);
    });
}

export async function deletePromptAudio(promptId: string, language: string): Promise<void> {
  return architectApi
    .deleteArchitectPromptResourceAudio(promptId, language)
    .then(() => {
      console.log("deleteArchitectPromptResource success!");
      const toastProp: Toast = {
        toastType: ToastType.Success,
        title: "Prompt resource deleted",
        message: `Success. Prompt resource deleted for ${language}`,
        timeoutSeconds: 2,
      };
      addToast(toastProp);
      return Promise.resolve();
    })
    .catch((err: string) => {
      console.log(err);
      const toastProp: Toast = {
        toastType: ToastType.Error,
        title: "Prompt resource deleted",
        message: `Error deleting Prompt resource for ${language}`,
        timeoutSeconds: 2,
      };
      addToast(toastProp);
    });
}

export async function deletePrompt(promptId: string): Promise<void> {
  let opts = {
    allResources: true, // Boolean | Whether or not to delete all the prompt resources
  };
  return architectApi
    .deleteArchitectPrompt(promptId, opts)
    .then(() => {
      console.log("deleteArchitectPrompt success!");
      const toastProp: Toast = {
        toastType: ToastType.Success,
        title: "Prompt deleted",
        message: "Success. Prompt deleted successfully",
        timeoutSeconds: 2,
      };
      addToast(toastProp);
      return Promise.resolve();
    })
    .catch((err: any) => {
      console.log("There was a failure calling deleteArchitectPrompt");
      console.error(err);
      const toastProp: Toast = {
        toastType: ToastType.Error,
        title: "Prompt deleted",
        message: "Error deleting prompt",
        timeoutSeconds: 2,
      };
      addToast(toastProp);
      return err;
    });
}
