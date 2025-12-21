/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./views/**/*.ejs", // Adjust path based on your project structure
        // Add other paths if you use Tailwind classes elsewhere, e.g., JS files
    ],
    theme: {
      extend: {},
      gridTemplateColumn: {
            'auto': 'repeat(auto-fit, minmax(200px, 1fr))'
        },
        fontFamily: {
            'Roboto': ["Roboto", "serif"],
            'Ovo': ["Ovo", "serif"],
            'Outfit': ["Outfit", "serif"],
        },
        animation:{
            spin_slow: 'spin 6s linear infinite'
        }
    },
    plugins: [],
};

