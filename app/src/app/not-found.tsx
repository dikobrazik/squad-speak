import { Button } from "@heroui/button";
import { I18n } from "components/I18n";

export default function NotFound() {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-2">
      <h2 className="text-lg font-bold">
        <I18n id="notFound.title" />
      </h2>
      <p>
        <I18n id="notFound.message" />
      </p>
      <Button as="a" href="/">
        <I18n id="notFound.returnHome" />
      </Button>
    </div>
  );
}
