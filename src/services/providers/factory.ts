import { QuranDataProvider } from "./types";
import { SdkProvider } from "./sdk";
import { RestProvider } from "./rest";
import { MockProvider } from "./mock";

let _provider: QuranDataProvider | null = null;

export function getProvider(): QuranDataProvider {
  if (_provider) return _provider;

  const mode = process.env.QURAN_PROVIDER || "rest";

  switch (mode) {
    case "sdk":
      _provider = new SdkProvider();
      break;
    case "mock":
      _provider = new MockProvider();
      break;
    case "rest":
    default:
      _provider = new RestProvider();
      break;
  }

  return _provider;
}
