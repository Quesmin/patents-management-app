/** @type {import('tailwindcss').Config} */

import daisyui from "daisyui";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [tailwindcssTypography, daisyui],
    daisyui: {
        themes: ["light", "dark", "synthwave"],
    },
};
