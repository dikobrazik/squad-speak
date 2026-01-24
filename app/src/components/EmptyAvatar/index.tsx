import { Icon } from "../Icon";

export const EmptyAvatar = () => {
  return (
    <div
      className="w-12.5 h-12.5 bg-background flex items-center justify-center"
      style={{ color: "firebrick" }}
    >
      <Icon name="generation1" color="white" size={30} />
    </div>
  );
};
