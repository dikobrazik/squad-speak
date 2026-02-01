import { Button } from "@heroui/button";
import { Link as HeroLink } from "@heroui/link";
import { cn } from "@heroui/theme";
import { I18n } from "components/I18n";
import Image from "next/image";
import Link from "next/link";
import section1Image from "./assets/section1.svg";
import section2Image from "./assets/section2.svg";
import section3Image from "./assets/section3.svg";
import css from "./Page.module.scss";

export default function LandingPage() {
  return (
    <>
      <nav className="p-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src="/assets/logo.svg"
            alt="SquadSpeak Logo"
            width={128}
            height={72}
            priority
          />
        </Link>

        <Button as={HeroLink} color="primary" href="/app">
          <I18n id="landingPage.enter" />
        </Button>
      </nav>

      <section
        className={cn(css.head, "h-screen flex justify-center items-center")}
      >
        <h1 className={css.heading}>
          <I18n id="landingPage.heading" rich />
        </h1>
      </section>

      <section className={css.section}>
        <h2>
          <I18n id="landingPage.section1Heading" />
        </h2>

        <Image
          src={section1Image}
          alt="Section 1 Illustration"
          width={400}
          height={400}
        />
      </section>

      <section className={css.section}>
        <Image
          src={section2Image}
          alt="Section 2 Illustration"
          width={400}
          height={400}
        />
        <h2>
          <I18n id="landingPage.section2Heading" />
        </h2>
      </section>

      <section className={css.section}>
        <h2>
          <I18n id="landingPage.section3Heading" />
        </h2>
        <Image
          src={section3Image}
          alt="Section 3 Illustration"
          width={400}
          height={400}
        />
      </section>

      <footer className="p-4">
        <Link href="/">
          <Image
            src="/assets/logo.svg"
            alt="SquadSpeak Logo"
            width={128}
            height={72}
          />
        </Link>
      </footer>
    </>
  );
}
