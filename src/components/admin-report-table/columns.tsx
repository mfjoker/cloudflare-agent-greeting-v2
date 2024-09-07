"use client";
import { createColumnHelper } from "@tanstack/react-table";
import {
  IAgentGreetingUserReport,
  IResourceState,
} from "../../state/selectors/AgentGreetingUserReport";

const columnHelper = createColumnHelper<IAgentGreetingUserReport>();

export const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    enableColumnFilter: false,
    meta: {
      type: "string",
      width: 0,
    },
  }),
  columnHelper.accessor("name", {
    header: "Name",
    enableColumnFilter: true,
    meta: {
      type: "string",
      width: 100,
    },
  }),
  columnHelper.accessor("hasInboundPrompt", {
    header: "Inbound Prompt Exists",
    enableColumnFilter: true,
    meta: {
      type: "boolean",
      width: 100,
    },
  }),
  columnHelper.display({
    id: "inbound",
    header: "Inbound Resources",
    cell(props) {
      return (
        <>
          <div>Has Audio?</div>
          <table className="border">
            <tbody>
              {props.row.original.inbound.resourceState.map(
                (resource: IResourceState) => (
                  <tr key={resource.language}>
                    <td className="m-2 px-2 border">{resource.language}</td>
                    <td className="border">{String(resource.hasAudio)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      );
    },
  }),
  columnHelper.accessor("hasOutboundPrompt", {
    header: "Outbound Prompt Exists",
    enableColumnFilter: true,
    meta: {
      type: "boolean",
      width: 100,
    },
  }),
  columnHelper.display({
    id: "outbound",
    header: "Outbound Resources",
    cell(props) {
      return (
        <>
          <div>Has Audio?</div>
          <table className="border">
            <tbody>
              {props.row.original.outbound.resourceState.map(
                (resource: IResourceState) => (
                  <tr key={resource.language}>
                    <td className="m-2 px-2 border">{resource.language}</td>
                    <td className="border">{String(resource.hasAudio)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </>
      );
    },
  }),
];
