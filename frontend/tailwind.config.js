/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#e2e8f0",
        sky: "#dbeafe",
        brand: "#0f766e",
        brandDark: "#115e59",
        warm: "#f8fafc",
      },
      boxShadow: {
        soft: "0 20px 45px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
