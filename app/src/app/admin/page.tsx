"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { useQuery } from "@tanstack/react-query";
import { getUsersList } from "@/src/api";
import { getProfilePhotoUrl } from "@/src/api/telegram";
import { ExternalImage } from "@/src/components/ExternalImage";

export default function AdminPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersList,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading users.</div>;
  }

  return (
    <div className="h-screen">
      <Table>
        <TableHeader>
          <TableColumn>User Photo</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Username (ID)</TableColumn>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <ExternalImage
                  src={getProfilePhotoUrl(user.user_id)}
                  alt={user.name || "User Photo"}
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                @{user.username} (ID: {user.id})
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* {data.map((user) => (
        <div key={user.id}>
          {" "}
          <ExternalImage
            src={getProfilePhotoUrl(user.user_id)}
            alt={data?.name || "User Photo"}
            width={50}
            height={50}
          />
          <div>{user.name}</div>
          <div>
            @{user.username} (ID: {user.id})
          </div>
        </div>
      ))} */}
    </div>
  );
}
