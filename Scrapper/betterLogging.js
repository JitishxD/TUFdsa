const printStyled = (icon, color, message) => {
  console.log(
    `%c--- Jitish --- ${icon} ${message}`,
    `
        color: ${color};
        font-weight: 600;
        font-size: 15px;
        font-family: 'Cascadia Code';
        letter-spacing: 0.5px;
        `,
  );
};

export const printWarn = (msg) => printStyled("⚠", "#ff9800", msg);
export const printError = (msg) => printStyled("❌", "red", msg);
export const printInfo = (msg) => printStyled("ℹ", "#2196f3", msg);
export const printSuccess = (msg) => printStyled("✅", "#4caf50", msg);
