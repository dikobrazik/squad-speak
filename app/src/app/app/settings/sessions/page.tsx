"use client";

import { Button } from "@heroui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { addToast } from "@heroui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getActiveSessions, invalidateSession } from "api";
import { Icon } from "components/Icon";
import { LoadingPage } from "components/LoadingPage";
import { formatDateTime } from "utils/date-formatter";

export default function SessionsSettingsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: getActiveSessions,
  });

  const { mutate: mutateInvalidateSession } = useMutation({
    mutationKey: ["invalidate-session"],
    mutationFn: invalidateSession,
    onSuccess: () => {
      refetch();

      addToast({
        title: "Session invalidated",
        color: "success",
      });
    },
    onError: () => {
      addToast({
        title: "Failed to invalidate session",
        color: "danger",
      });
    },
  });

  if (isLoading) {
    return <LoadingPage height="full" />;
  }

  return (
    <Table className="h-full">
      <TableHeader>
        {/* <TableColumn>Session ID</TableColumn> */}
        <TableColumn>DeviceId</TableColumn>
        <TableColumn>CreatedAt</TableColumn>
        <TableColumn>LastActiveAt</TableColumn>
        <TableColumn>
          <></>
        </TableColumn>
      </TableHeader>
      <TableBody>
        {(data ?? []).map((session) => (
          <TableRow key={session.id}>
            {/* <TableCell>{session.id}</TableCell> */}
            <TableCell>{session.deviceId}</TableCell>
            <TableCell>{formatDateTime(session.createdAt)}</TableCell>
            <TableCell>{formatDateTime(session.lastActiveAt)}</TableCell>
            <TableCell>
              {session.deviceId !== "current" && (
                <Button
                  onPress={() => mutateInvalidateSession(session.id)}
                  isIconOnly
                  color="danger"
                >
                  <Icon name="trash" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
