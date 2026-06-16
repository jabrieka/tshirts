import QRCode from "qrcode";
import type { Palette } from "./palette";

export async function renderQrPng(targetUrl: string, palette: Palette): Promise<Buffer> {
  return QRCode.toBuffer(targetUrl, {
    type: "png",
    width: 720,
    margin: 2,
    color: {
      dark: palette.text === "#FAF5EA" ? palette.primary : palette.background,
      light: palette.text === "#FAF5EA" ? palette.background : "#FFFFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

export async function renderQrDataUrl(targetUrl: string, palette: Palette): Promise<string> {
  return QRCode.toDataURL(targetUrl, {
    width: 360,
    margin: 1,
    color: {
      dark: palette.text === "#FAF5EA" ? palette.primary : palette.background,
      light: palette.text === "#FAF5EA" ? palette.background : "#FFFFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}
