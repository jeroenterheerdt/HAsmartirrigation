import * as en from "./languages/en.json";
import * as nl from "./languages/nl.json";
import * as de from "./languages/de.json";

import IntlMessageFormat from "intl-messageformat";

const languages: any = {
  de: de,
  en: en,
  nl: nl,
};

export function localize(
  string: string,
  language: string,
  ...args: any[]
): string {
  const lang = language.replace(/['"]+/g, "");
  let translated: string;

  try {
    translated = string.split(".").reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    translated = string.split(".").reduce((o, i) => o[i], languages["en"]);
  }

  if (translated === undefined)
    translated = string.split(".").reduce((o, i) => o[i], languages["en"]);

  if (!args.length) return translated;

  const argObject = {};
  for (let i = 0; i < args.length; i += 2) {
    let key = args[i];
    key = key.replace(/^{([^}]+)?}$/, "$1");
    argObject[key] = args[i + 1];
  }

  try {
    const message = new IntlMessageFormat(translated, language);
    return message.format(argObject) as string;
  } catch (err) {
    return "Translation " + err;
  }
}
