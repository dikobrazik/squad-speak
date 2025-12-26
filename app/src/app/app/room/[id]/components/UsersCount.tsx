"use client";

export const UsersCount = ({ count }: { count: number }) => {
  if (count === 1) return <div>There's no other users in the room</div>;

  return <div>{count} user(s) in the room</div>;
};
