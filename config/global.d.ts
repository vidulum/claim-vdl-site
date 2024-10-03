interface Window {
  keplr: any; // Define the keplr property as 'any' type (you can refine this if you have specific typings for Keplr)
}

declare module 'bip39' {
  const bip39: any;
  export = bip39;
}
