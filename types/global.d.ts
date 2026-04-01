interface ReCaptchaV3 {
  execute(siteKey: string, options: { action: string }): Promise<string>;
  ready(callback: () => void): void;
}

interface Window {
  grecaptcha: ReCaptchaV3;
}
