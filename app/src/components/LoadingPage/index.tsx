import { Spinner } from "@heroui/spinner";

type Props = {
  height?: "full" | "screen";
};

export const LoadingPage = ({ height = "screen" }: Props) => (
  <div
    className={`w-full ${height === "full" ? "h-full" : "h-screen"} flex justify-center items-center`}
  >
    <Spinner />
  </div>
);
