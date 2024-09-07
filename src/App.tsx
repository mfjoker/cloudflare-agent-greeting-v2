"use client";

import { useEffect, useState } from "react";
import {
  authenticate,
  getAgentGreetingGroupMembers,
  getAgentGreetingPrompts,
  // getDataTableRows,
  getUserMe,
  getUserRoles,
} from "./utils/genesys/genesysCloudUtils";
import {
  IDomainRole,
  IPrompt,
  IPromptEntityListing,
  IUserAuthorization,
  IUserDetails,
} from "./utils/genesys/interface";
import { authenticatedUser, GroupMember } from "./utils/misc/types";
import { clientConfig } from "./utils/genesys/clientConfig";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { groupMembersState } from "./state/atoms/groupMembers";
import { athenticatedUserState } from "./state/atoms/authenticatedUser";
import { promptsState } from "./state/atoms/prompts";
import { agentGreetingUserReportState } from "./state/selectors/AgentGreetingUserReport";
import MemberTable from "./components/member-table/member-table";
import EditPromptModal from "./components/edit-prompt-modal/edit-prompt-modal";
import AdminReportModal from "./components/admin-report-modal/admin-report-modal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const adminRole = clientConfig.agentGreetingAdminRole;
  const [initialized, setInitialized] = useState<boolean>(false);
  // const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupMember, setGroupMembers] = useRecoilState(groupMembersState);
  const setPrompts = useSetRecoilState(promptsState);
  const [authenticatedUser, setAuthenticatedUser] = useRecoilState(
    athenticatedUserState
  );
  const [showInbound, setShowInbound] = useState<boolean>(false);
  const [showOutbound, setShowOutbound] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const agentGreetingUserReport = useRecoilValue(agentGreetingUserReportState);
  const [showAdminReport, setShowAdminReport] = useState<boolean>(false);
  //const [prompts, setPrompts] = useState<IPrompt[]>([]);

  useEffect(() => {
    //debugger;
    //console.log(`window.location.hash: ${window.location.hash}`);
    setInitialized(false);
    getPlatformClientData();
  }, []);

  async function getPlatformClientData() {
    setInitialized(false);
    await authenticate()
      .then((data: any) => {
        setAuthenticatedUser((prev: authenticatedUser) => ({
          ...prev,
          token: data.accessToken,
        }));
        return getUserMe();
      })
      .then((userDetailsResponse: IUserDetails) => {
        //console.log("User Details", userDetailsResponse);

        setAuthenticatedUser((prev) => ({
          ...prev,
          id: userDetailsResponse.id || "",
          name: userDetailsResponse.name || "",
          email: userDetailsResponse.email || "",
        }));

        return getUserRoles(userDetailsResponse.id || "");
      })
      .then((data: IUserAuthorization) => {
        if (data.roles === undefined) {
          return;
        }
        // let roles: string[] = [];
        const roles =
          data.roles.map(function (role: IDomainRole) {
            return role.name || "";
          }) ?? [];
        roles.includes(adminRole) ? setIsAdmin(true) : setIsAdmin(false);
        console.log("Roles", roles);
        setAuthenticatedUser((prev) => ({ ...prev, roles: roles }));

        return getAgentGreetingPrompts();
      })
      .then((data: IPromptEntityListing | undefined) => {
        console.log("Prompt Data: ", data);
        if (data === undefined) {
          return;
        }
        setPrompts(data.entities as IPrompt[]);

        return getAgentGreetingGroupMembers();
      })
      .then((data: any) => {
        console.log("Group data entities returned: ", data.entities);
        //console.log("In getAgentGreetingsGroupMembers...Prompts: ", prompts);

        const members: GroupMember[] = data.entities
          .filter((user: any) => user.state === "active")
          .map((member: GroupMember) => {
            return {
              id: member.id,
              name: member.name,
              username: member.username,
            };
          });
        setGroupMembers(members ?? []);
        console.log(
          "Group Members: ",
          groupMember,
          "; Members variable: ",
          members
        );
        console.log("AuthenticatedUser: ", authenticatedUser);
        setInitialized(true);
      })

      .catch((err: any) => {
        console.error(err);
      });
  }

  const handleUserReport = () => {
    console.log(
      "Agent Greeting User Report clicked : ",
      agentGreetingUserReport
    );
    setShowAdminReport(true);
  };

  // const handleTestButton = () => {
  //   setShowInbound((prev) => !prev);
  //   console.log(`show: ${showInbound}`);
  // };

  return (
    <>
      <section className="flex flex-col justify-center text-center font-roboto">
        <h1 className="font-bold underline text-blue-800">
          Agent Greetings Configuration
        </h1>
        <h3>
          All prompts will be saved with a prefix of AG_ followed by userId
          (guid) and ending with _inbound or _outbound
        </h3>
        <h3 className="mb-4">
          For example, AG_bc5ac39f-54ab-42e6-a7fb-fe8089a265b3_inbound
        </h3>
        {isAdmin ? (
          <button
            className="flex justify-center bg-blue-500 text-neutral-200 w-60 mx-auto py-2 px-4 rounded-xl"
            onClick={() => handleUserReport()}
          >
            Agent Greeting User Report
          </button>
        ) : null}

        <div className="flex justify-center">
          {initialized ? <MemberTable /> : <p>Loading...</p>}
        </div>
      </section>
      {showInbound ? (
        <EditPromptModal direction="inbound" setShow={setShowInbound} />
      ) : null}
      {showOutbound ? (
        <EditPromptModal direction="outbound" setShow={setShowOutbound} />
      ) : null}
      {showAdminReport ? (
        <AdminReportModal setShow={setShowAdminReport} />
      ) : null}

      <div>
        <ToastContainer
          closeButton={true}
          position="top-center"
          newestOnTop={true}
          theme="colored"
        />
      </div>
    </>
  );
}

export default App;
