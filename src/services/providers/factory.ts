import { QuranDataProvider } from "./types";
import { SdkProvider } from "./sdk";
import { RestProvider } from "./rest";
import { MockProvider } from "./mock";
import { KalimatSearchProvider } from "./kalimat";

let _provider: QuranDataProvider | null = null;
let _searchProvider: QuranDataProvider | null = null;

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

export function getSearchProvider(): QuranDataProvider {
  if (_searchProvider) return _searchProvider;

  const mainProvider = getProvider();
  const kalimatApiKey = process.env.KALIMAT_API_KEY;

  if (kalimatApiKey) {
    _searchProvider = new KalimatSearchProvider(mainProvider, kalimatApiKey);
  } else {
    _searchProvider = mainProvider;
  }

  return _searchProvider;
}
