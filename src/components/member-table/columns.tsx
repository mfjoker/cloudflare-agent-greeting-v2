"use client";
import { createColumnHelper } from "@tanstack/react-table";
import EditButtonCell from "./edit-button-cell";
import { GroupMember } from "../../utils/misc/types";

const columnHelper = createColumnHelper<GroupMember>();

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
  columnHelper.accessor("username", {
    header: "Email/UserName",
    enableColumnFilter: true,
    meta: {
      type: "string",
      width: 100,
    },
  }),
  columnHelper.display({
    id: "inbound",
    header: "Inbound",
    cell(props) {
      return (
        <EditButtonCell
          user={{
            id: props.row.original.id,
            name: props.row.original.name,
            username: props.row.original.username,
          }}
          direction="inbound"
        />
      );
    },
  }),
  columnHelper.display({
    id: "outbound",
    header: "Outbound",
    cell(props) {
      return (
        <EditButtonCell
          user={{
            id: props.row.original.id,
            name: props.row.original.name,
            username: props.row.original.username,
          }}
          direction="outbound"
        />
      );
    },
  }),
];
