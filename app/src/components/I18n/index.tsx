import { useTranslations } from "next-intl";

type I18nProps = {
  id: `${string}.${string}`;
  rich?: boolean;
  params?: Record<string, string | number>;
};

export const I18n = (props: I18nProps) => {
  const { id, rich, params } = props;
  const namespace = id.split(".")[0];
  const key = id.split(".").slice(1).join(".");
  const t = useTranslations(namespace);

  if (rich) {
    return (
      <>
        {t.rich(key, {
          br: (children) => <br />,
          span: (children) => <span>{children}</span>,
        })}
      </>
    );
  }

  return <>{t(key, params)}</>;
};
